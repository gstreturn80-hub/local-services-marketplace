import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET: Retrieve all distinct service areas (states, cities, areas, pincodes) to feed dropdowns
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filterPincode = searchParams.get("pincode");
    const filterCity = searchParams.get("city");

    if (filterPincode) {
      const areas = await prisma.serviceArea.findMany({
        where: { pincode: filterPincode },
        include: {
          providerProfile: {
            include: {
              user: true
            }
          }
        }
      });
      return NextResponse.json(areas);
    }

    if (filterCity) {
      const areas = await prisma.serviceArea.findMany({
        where: { city: { contains: filterCity } },
        distinct: ["area"]
      });
      return NextResponse.json(areas);
    }

    const allAreas = await prisma.serviceArea.findMany({
      select: {
        id: true,
        country: true,
        state: true,
        district: true,
        city: true,
        area: true,
        pincode: true,
      },
      distinct: ["pincode"]
    });

    return NextResponse.json(allAreas);
  } catch (error: any) {
    console.error("Areas fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
