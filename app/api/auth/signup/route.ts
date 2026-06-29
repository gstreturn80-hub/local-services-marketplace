import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, setSessionCookie } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      email, 
      password, 
      name, 
      role, 
      phone, 
      address, 
      // Provider specific fields
      mobileNumber,
      bio,
      experience,
      skills,
      bankAccount,
      upiId,
      gstNumber,
      aadhaarUrl,
      selfieUrl,
      serviceAreas // expected: array of { state, district, city, area, pincode }
    } = body;
    
    if (!email || !password || !name || !role) {
      return NextResponse.json({ error: "Email, password, name, and role are required" }, { status: 400 });
    }

    if (role !== "CUSTOMER" && role !== "PROVIDER" && role !== "ADMIN") {
      return NextResponse.json({ error: "Invalid role specified" }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ error: "User already exists with this email" }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);

    // Create user using a transaction
    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          name,
          passwordHash: hashedPassword,
          role,
          avatarUrl: role === "PROVIDER" ? selfieUrl : `https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200`
        }
      });

      if (role === "CUSTOMER") {
        await tx.customerProfile.create({
          data: {
            userId: user.id,
            phone: phone || "",
            address: address || "",
          }
        });
      } else if (role === "PROVIDER") {
        const skillsString = Array.isArray(skills) ? skills.join(",") : (skills || "");
        const experienceYears = parseInt(experience, 10) || 0;

        const profile = await tx.providerProfile.create({
          data: {
            userId: user.id,
            mobileNumber: mobileNumber || "",
            bio: bio || "",
            experience: experienceYears,
            skills: skillsString,
            bankAccount: bankAccount || "",
            upiId: upiId || "",
            gstNumber: gstNumber || "",
            aadhaarUrl: aadhaarUrl || "",
            selfieUrl: selfieUrl || "",
            isVerified: false,
            verificationStatus: "PENDING",
            status: "AVAILABLE",
          }
        });

        // Add service areas if provided
        if (serviceAreas && Array.isArray(serviceAreas)) {
          for (const area of serviceAreas) {
            await tx.serviceArea.create({
              data: {
                providerProfileId: profile.id,
                state: area.state || "",
                district: area.district || "",
                city: area.city || "",
                area: area.area || "",
                pincode: area.pincode || "",
              }
            });
          }
        }
      }

      return user;
    });

    const sessionData = {
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
      name: newUser.name,
    };
    
    await setSessionCookie(sessionData);

    // Return the new user
    const dbUser = await prisma.user.findUnique({
      where: { id: newUser.id },
      include: {
        customerProfile: true,
        providerProfile: {
          include: {
            serviceAreas: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      user: {
        id: dbUser?.id,
        email: dbUser?.email,
        name: dbUser?.name,
        role: dbUser?.role,
        avatarUrl: dbUser?.avatarUrl,
        customerProfile: dbUser?.customerProfile,
        providerProfile: dbUser?.providerProfile,
      }
    });
  } catch (error: any) {
    console.error("Signup API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
