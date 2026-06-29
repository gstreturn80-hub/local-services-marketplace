import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

// PUT: Approve or reject provider verification credentials
export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
    }

    const body = await request.json();
    const { providerProfileId, action, rejectionReason } = body; // action: "APPROVE" or "REJECT"

    if (!providerProfileId || !action) {
      return NextResponse.json({ error: "Provider Profile ID and Action are required" }, { status: 400 });
    }

    const providerProfile = await prisma.providerProfile.findUnique({
      where: { id: providerProfileId }
    });

    if (!providerProfile) {
      return NextResponse.json({ error: "Provider profile not found" }, { status: 404 });
    }

    let status = "PENDING";
    let isVerified = false;
    let reasonText = null;

    if (action === "APPROVE") {
      status = "APPROVED";
      isVerified = true;
    } else if (action === "REJECT") {
      status = "REJECTED";
      isVerified = false;
      reasonText = rejectionReason || "Documents did not match requirements.";
    } else {
      return NextResponse.json({ error: "Invalid action. Must be APPROVE or REJECT" }, { status: 400 });
    }

    const updatedProfile = await prisma.providerProfile.update({
      where: { id: providerProfileId },
      data: {
        verificationStatus: status,
        isVerified,
        rejectionReason: reasonText
      },
      include: {
        user: true
      }
    });

    return NextResponse.json({ success: true, profile: updatedProfile });
  } catch (error: any) {
    console.error("Admin verification error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET: Fetch all providers pending verification (or all providers for list)
export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status"); // "PENDING", "APPROVED", "REJECTED"

    const where: any = {};
    if (status) {
      where.verificationStatus = status;
    }

    const providers = await prisma.providerProfile.findMany({
      where,
      include: {
        user: true,
        serviceAreas: true
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(providers);
  } catch (error: any) {
    console.error("Admin providers fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
