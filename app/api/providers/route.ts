import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

// GET: Query/Search service providers with filters
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const pincode = searchParams.get("pincode");
    const city = searchParams.get("city");
    const area = searchParams.get("area");
    const rating = searchParams.get("rating");
    const verified = searchParams.get("verified");
    const availableNow = searchParams.get("availableNow");
    const availableToday = searchParams.get("availableToday");
    const searchQuery = searchParams.get("search");
    const id = searchParams.get("id"); // Fetch single provider details

    // If ID is provided, retrieve complete single provider details
    if (id) {
      const provider = await prisma.providerProfile.findUnique({
        where: { id },
        include: {
          serviceAreas: true,
          portfolioItems: true,
          user: {
            include: {
              reviewsAsProvider: {
                include: {
                  customer: true
                },
                orderBy: {
                  createdAt: "desc"
                }
              }
            }
          }
        }
      });

      if (!provider) {
        return NextResponse.json({ error: "Provider not found" }, { status: 404 });
      }

      return NextResponse.json(provider);
    }

    // Otherwise, fetch all approved providers
    let providers = await prisma.providerProfile.findMany({
      where: {
        verificationStatus: "APPROVED",
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            avatarUrl: true,
          }
        },
        serviceAreas: true,
        portfolioItems: true,
      }
    });

    // Apply filtering in memory
    if (category) {
      providers = providers.filter(p => 
        p.skills.toLowerCase().split(",").map(s => s.trim()).includes(category.toLowerCase())
      );
    }

    if (pincode) {
      providers = providers.filter(p => 
        p.serviceAreas.some(sa => sa.pincode === pincode)
      );
    }

    if (city) {
      providers = providers.filter(p => 
        p.serviceAreas.some(sa => sa.city.toLowerCase().trim() === city.toLowerCase().trim())
      );
    }

    if (area) {
      providers = providers.filter(p => 
        p.serviceAreas.some(sa => sa.area.toLowerCase().trim() === area.toLowerCase().trim())
      );
    }

    if (rating) {
      const minRating = parseFloat(rating);
      providers = providers.filter(p => p.rating >= minRating);
    }

    if (verified === "true") {
      providers = providers.filter(p => p.isVerified);
    }

    // Availability checks
    const now = new Date();
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const currentDay = daysOfWeek[now.getDay()];
    const currentHourMin = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const todayStr = now.toISOString().split("T")[0]; // YYYY-MM-DD

    if (availableToday === "true") {
      providers = providers.filter(p => {
        const workingDays = p.workingDays.split(",").map(d => d.trim());
        const holidayDates = p.holidayDates.split(",").map(d => d.trim());
        const blockedDates = p.blockedDates.split(",").map(d => d.trim());
        
        const matchesDay = workingDays.includes(currentDay);
        const isHoliday = holidayDates.includes(todayStr);
        const isBlocked = blockedDates.includes(todayStr);
        
        return matchesDay && !isHoliday && !isBlocked && p.status !== "OFFLINE";
      });
    }

    if (availableNow === "true") {
      providers = providers.filter(p => {
        const workingDays = p.workingDays.split(",").map(d => d.trim());
        const holidayDates = p.holidayDates.split(",").map(d => d.trim());
        const blockedDates = p.blockedDates.split(",").map(d => d.trim());
        
        const matchesDay = workingDays.includes(currentDay);
        const isHoliday = holidayDates.includes(todayStr);
        const isBlocked = blockedDates.includes(todayStr);
        
        const isWorkingHours = currentHourMin >= p.workingHoursStart && currentHourMin <= p.workingHoursEnd;
        
        return matchesDay && !isHoliday && !isBlocked && isWorkingHours && p.status === "AVAILABLE";
      });
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      providers = providers.filter(p => 
        p.user.name.toLowerCase().includes(q) || 
        (p.bio && p.bio.toLowerCase().includes(q)) ||
        p.skills.toLowerCase().includes(q)
      );
    }

    return NextResponse.json(providers);
  } catch (error: any) {
    console.error("Providers search error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT: Update provider profile
export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "PROVIDER") {
      return NextResponse.json({ error: "Unauthorized. Provider access required." }, { status: 403 });
    }

    const body = await request.json();
    const {
      mobileNumber,
      bio,
      experience,
      skills,
      bankAccount,
      upiId,
      gstNumber,
      status, // "AVAILABLE", "BUSY", "OFFLINE"
      workingDays,
      workingHoursStart,
      workingHoursEnd,
      holidayDates,
      blockedDates,
      emergencyAvailable,
      serviceAreas, // Expected: array of { state, district, city, area, pincode }
      newPortfolioItem, // Expected: { imageUrl, title, type }
      deletePortfolioItemId
    } = body;

    // Fetch the provider profile ID
    const providerProfile = await prisma.providerProfile.findUnique({
      where: { userId: session.userId }
    });

    if (!providerProfile) {
      return NextResponse.json({ error: "Provider profile not found" }, { status: 404 });
    }

    const updatedProfile = await prisma.$transaction(async (tx) => {
      // 1. Update basic details
      const profile = await tx.providerProfile.update({
        where: { id: providerProfile.id },
        data: {
          mobileNumber: mobileNumber !== undefined ? mobileNumber : providerProfile.mobileNumber,
          bio: bio !== undefined ? bio : providerProfile.bio,
          experience: experience !== undefined ? parseInt(experience, 10) : providerProfile.experience,
          skills: skills !== undefined ? (Array.isArray(skills) ? skills.join(",") : skills) : providerProfile.skills,
          bankAccount: bankAccount !== undefined ? bankAccount : providerProfile.bankAccount,
          upiId: upiId !== undefined ? upiId : providerProfile.upiId,
          gstNumber: gstNumber !== undefined ? gstNumber : providerProfile.gstNumber,
          status: status !== undefined ? status : providerProfile.status,
          workingDays: workingDays !== undefined ? workingDays : providerProfile.workingDays,
          workingHoursStart: workingHoursStart !== undefined ? workingHoursStart : providerProfile.workingHoursStart,
          workingHoursEnd: workingHoursEnd !== undefined ? workingHoursEnd : providerProfile.workingHoursEnd,
          holidayDates: holidayDates !== undefined ? holidayDates : providerProfile.holidayDates,
          blockedDates: blockedDates !== undefined ? blockedDates : providerProfile.blockedDates,
          emergencyAvailable: emergencyAvailable !== undefined ? emergencyAvailable : providerProfile.emergencyAvailable,
        }
      });

      // 2. Manage service areas if supplied
      if (serviceAreas && Array.isArray(serviceAreas)) {
        // Clear existing service areas
        await tx.serviceArea.deleteMany({
          where: { providerProfileId: profile.id }
        });

        // Create new ones
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

      // 3. Add portfolio item
      if (newPortfolioItem) {
        await tx.portfolioItem.create({
          data: {
            providerProfileId: profile.id,
            imageUrl: newPortfolioItem.imageUrl,
            title: newPortfolioItem.title || "",
            type: newPortfolioItem.type || "WORK"
          }
        });
      }

      // 4. Delete portfolio item
      if (deletePortfolioItemId) {
        await tx.portfolioItem.delete({
          where: { id: deletePortfolioItemId }
        });
      }

      return profile;
    });

    const refreshed = await prisma.providerProfile.findUnique({
      where: { id: updatedProfile.id },
      include: {
        serviceAreas: true,
        portfolioItems: true
      }
    });

    return NextResponse.json({ success: true, profile: refreshed });
  } catch (error: any) {
    console.error("Provider update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
