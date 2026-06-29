import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

// POST: Add review and recalculate provider average rating
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "CUSTOMER") {
      return NextResponse.json({ error: "Unauthorized. Customer account required." }, { status: 401 });
    }

    const body = await request.json();
    const { bookingId, rating, comment, photos } = body;

    if (!bookingId || !rating || !comment) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        provider: {
          include: {
            providerProfile: true
          }
        }
      }
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.customerId !== session.userId) {
      return NextResponse.json({ error: "Forbidden. You did not make this booking." }, { status: 403 });
    }

    if (booking.status !== "COMPLETED") {
      return NextResponse.json({ error: "Cannot review an uncompleted service" }, { status: 400 });
    }

    // Check if review already exists
    const existingReview = await prisma.review.findUnique({
      where: { bookingId }
    });

    if (existingReview) {
      return NextResponse.json({ error: "You have already reviewed this booking" }, { status: 400 });
    }

    const review = await prisma.$transaction(async (tx) => {
      // 1. Create review
      const res = await tx.review.create({
        data: {
          bookingId,
          customerId: session.userId,
          providerId: booking.providerId,
          rating: parseInt(rating, 10),
          comment,
          photos: photos || ""
        }
      });

      // 2. Fetch all reviews for this provider to recalculate rating
      const allReviews = await tx.review.findMany({
        where: { providerId: booking.providerId }
      });

      const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

      // 3. Update provider average rating
      if (booking.provider.providerProfile) {
        await tx.providerProfile.update({
          where: { id: booking.provider.providerProfile.id },
          data: {
            rating: parseFloat(avgRating.toFixed(1))
          }
        });
      }

      return res;
    });

    return NextResponse.json(review);
  } catch (error: any) {
    console.error("Post review error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
