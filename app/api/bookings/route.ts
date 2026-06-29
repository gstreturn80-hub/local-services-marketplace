import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

// GET: Retrieve bookings depending on user role
export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get("id");

    // Fetch single booking details
    if (bookingId) {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          customer: {
            select: { id: true, name: true, email: true, avatarUrl: true, customerProfile: true }
          },
          provider: {
            select: { id: true, name: true, email: true, avatarUrl: true, providerProfile: true }
          },
          reviews: true
        }
      });

      if (!booking) {
        return NextResponse.json({ error: "Booking not found" }, { status: 404 });
      }

      // Access control check
      if (session.role !== "ADMIN" && booking.customerId !== session.userId && booking.providerId !== session.userId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      return NextResponse.json(booking);
    }

    // Fetch lists
    let bookings;
    if (session.role === "ADMIN") {
      bookings = await prisma.booking.findMany({
        include: {
          customer: { select: { name: true, email: true } },
          provider: { select: { name: true, email: true } }
        },
        orderBy: { createdAt: "desc" }
      });
    } else if (session.role === "PROVIDER") {
      bookings = await prisma.booking.findMany({
        where: { providerId: session.userId },
        include: {
          customer: { select: { name: true, email: true, avatarUrl: true, customerProfile: true } }
        },
        orderBy: { createdAt: "desc" }
      });
    } else {
      // CUSTOMER
      bookings = await prisma.booking.findMany({
        where: { customerId: session.userId },
        include: {
          provider: { select: { name: true, email: true, avatarUrl: true, providerProfile: true } }
        },
        orderBy: { createdAt: "desc" }
      });
    }

    return NextResponse.json(bookings);
  } catch (error: any) {
    console.error("Fetch bookings error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST: Create a new booking
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "CUSTOMER") {
      return NextResponse.json({ error: "Unauthorized. Customer account required." }, { status: 401 });
    }

    const body = await request.json();
    const {
      providerId,
      serviceName,
      date,
      time,
      address,
      notes,
      images,
      bookingFee,
      paymentMethod,
      remainingAmount
    } = body;

    if (!providerId || !serviceName || !date || !time || !address || !bookingFee || !paymentMethod) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify provider exists
    const provider = await prisma.user.findFirst({
      where: { id: providerId, role: "PROVIDER" },
      include: { providerProfile: true }
    });

    if (!provider || !provider.providerProfile) {
      return NextResponse.json({ error: "Invalid provider specified" }, { status: 400 });
    }

    const booking = await prisma.booking.create({
      data: {
        customerId: session.userId,
        providerId,
        serviceName,
        date,
        time,
        address,
        notes: notes || "",
        images: images || "",
        bookingFee: parseInt(bookingFee, 10),
        paymentMethod,
        paymentStatus: "PAID", // Paid booking fee online
        status: "PENDING",
        remainingAmount: parseInt(remainingAmount, 10) || 0,
        remainingPaymentStatus: "PENDING",
      }
    });

    return NextResponse.json(booking);
  } catch (error: any) {
    console.error("Create booking error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT: Advance booking status / payments
export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { bookingId, status, remainingPaymentStatus, completionImages } = body;

    if (!bookingId) {
      return NextResponse.json({ error: "Booking ID is required" }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        provider: { include: { providerProfile: true } },
        customer: true
      }
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Control checks
    const isCustomer = booking.customerId === session.userId;
    const isProvider = booking.providerId === session.userId;
    const isAdmin = session.role === "ADMIN";

    if (!isCustomer && !isProvider && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updatedData: any = {};

    if (status) {
      // Validate transitions
      if (status === "ACCEPTED" || status === "CANCELLED") {
        if (!isProvider && !isAdmin && !(status === "CANCELLED" && isCustomer && booking.status === "PENDING")) {
          return NextResponse.json({ error: "Unauthorized status transition" }, { status: 403 });
        }
      }

      if (status === "ON_THE_WAY" || status === "STARTED" || status === "COMPLETED") {
        if (!isProvider && !isAdmin) {
          return NextResponse.json({ error: "Only provider can update active status steps" }, { status: 403 });
        }
      }

      updatedData.status = status;

      // Handle completion images
      if (status === "COMPLETED" && completionImages) {
        updatedData.completionImages = completionImages;
      }
    }

    if (remainingPaymentStatus) {
      if (!isCustomer && !isProvider && !isAdmin) {
        return NextResponse.json({ error: "Unauthorized payment status change" }, { status: 403 });
      }
      updatedData.remainingPaymentStatus = remainingPaymentStatus;
    }

    // Database transaction to write updates and process wallet ledger
    const updatedBooking = await prisma.$transaction(async (tx) => {
      const res = await tx.booking.update({
        where: { id: bookingId },
        data: updatedData
      });

      // Wallet Earnings Trigger on COMPLETION
      if (status === "COMPLETED" && booking.status !== "COMPLETED") {
        // Add earnings transaction to Provider
        // Example: Provider receives remaining amount + booking fee (minus platform commission of 10%)
        const platformCommission = Math.round(booking.bookingFee * 0.15); // 15% of booking fee
        const providerEarnings = booking.remainingAmount + (booking.bookingFee - platformCommission);

        await tx.walletTransaction.create({
          data: {
            userId: booking.providerId,
            amount: providerEarnings,
            type: "EARNING",
            status: "COMPLETED",
            description: `Job completed for booking #${booking.id.slice(0, 8)} (${booking.serviceName})`
          }
        });

        // Track completed job counter
        if (booking.provider.providerProfile) {
          await tx.providerProfile.update({
            where: { id: booking.provider.providerProfile.id },
            data: {
              completedJobs: { increment: 1 }
            }
          });
        }
      }

      // Wallet Refund Trigger on CANCELLATION
      if (status === "CANCELLED" && booking.status !== "CANCELLED") {
        // If provider cancels or admin cancels, refund customer the booking fee
        // (Typically cash refund simulated in logs or wallet ledger if wallet is enabled)
        if (isProvider || isAdmin) {
          await tx.walletTransaction.create({
            data: {
              userId: booking.customerId,
              amount: booking.bookingFee,
              type: "REFUND",
              status: "COMPLETED",
              description: `Refund for cancelled booking #${booking.id.slice(0, 8)}`
            }
          });
        }
      }

      return res;
    });

    return NextResponse.json(updatedBooking);
  } catch (error: any) {
    console.error("Update booking error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
