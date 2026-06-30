import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import type { Booking, ProviderProfile, ServiceArea, User } from "@prisma/client";

type BookingWithParties = Booking & {
  customer: { name: string; email: string };
  provider: { name: string; email: string };
};

type ProviderWithUserAndAreas = ProviderProfile & {
  user: User;
  serviceAreas: ServiceArea[];
};

// GET: Fetch dashboard reports & export CSV statistics
export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const exportCSV = searchParams.get("export"); // "true"
    const type = searchParams.get("type") || "summary"; // "summary" or "bookings" or "providers"

    if (exportCSV === "true") {
      let csvContent = "";
      let filename = "report.csv";

      if (type === "summary") {
        const totalCustomers = await prisma.user.count({ where: { role: "CUSTOMER" } });
        const totalProviders = await prisma.user.count({ where: { role: "PROVIDER" } });
        const verifiedProviders = await prisma.providerProfile.count({ where: { isVerified: true } });
        const pendingVerification = await prisma.providerProfile.count({ where: { verificationStatus: "PENDING" } });
        const totalBookings = await prisma.booking.count();
        const completedBookings = await prisma.booking.count({ where: { status: "COMPLETED" } });

        const bookingsList = await prisma.booking.findMany();
        const bookingFeeIncome = bookingsList.reduce(
          (sum: number, b: Booking) =>
            sum + b.bookingFee,
          0
        );
        const commissionIncome = Math.round(bookingFeeIncome * 0.15); // 15% platform commission

        csvContent = "Metric,Value\r\n";
        csvContent += `Total Customers,${totalCustomers}\r\n`;
        csvContent += `Total Providers,${totalProviders}\r\n`;
        csvContent += `Verified Providers,${verifiedProviders}\r\n`;
        csvContent += `Pending Verification,${pendingVerification}\r\n`;
        csvContent += `Total Bookings,${totalBookings}\r\n`;
        csvContent += `Completed Bookings,${completedBookings}\r\n`;
        csvContent += `Booking Fee Income (INR),${bookingFeeIncome}\r\n`;
        csvContent += `Commission Income (INR),${commissionIncome}\r\n`;
        csvContent += `Total Platform Revenue (INR),${bookingFeeIncome + commissionIncome}\r\n`;

        filename = "marketplace_summary.csv";
      } else if (type === "bookings") {
        const bookings = await prisma.booking.findMany({
          include: {
            customer: { select: { name: true, email: true } },
            provider: { select: { name: true, email: true } }
          },
          orderBy: { createdAt: "desc" }
        });

        csvContent = "Booking ID,Customer Name,Customer Email,Provider Name,Provider Email,Service,Date,Time,Address,Booking Fee (INR),Remaining Amount (INR),Status\r\n";
        bookings.forEach((b: BookingWithParties) => {
          csvContent += `"${b.id}","${b.customer.name}","${b.customer.email}","${b.provider.name}","${b.provider.email}","${b.serviceName}","${b.date}","${b.time}","${b.address.replace(/"/g, '""')}",${b.bookingFee},${b.remainingAmount},"${b.status}"\r\n`;
        });

        filename = "bookings_report.csv";
      } else if (type === "providers") {
        const providers = await prisma.providerProfile.findMany({
          include: { user: true, serviceAreas: true }
        });

        csvContent = "Provider ID,Name,Email,Mobile,Experience (Years),Skills,Rating,Completed Jobs,Verification Status,Areas Covered\r\n";
        providers.forEach((p: ProviderWithUserAndAreas) => {
          const areaCodes = p.serviceAreas.map((sa: ServiceArea) => sa.pincode).join("; ");
          csvContent += `"${p.id}","${p.user.name}","${p.user.email}","${p.mobileNumber}",${p.experience},"${p.skills.replace(/"/g, '""')}",${p.rating},${p.completedJobs},"${p.verificationStatus}","${areaCodes}"\r\n`;
        });

        filename = "providers_report.csv";
      }

      return new Response(csvContent, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="${filename}"`
        }
      });
    }

    // JSON response for dashboard display
    const totalCustomers = await prisma.user.count({ where: { role: "CUSTOMER" } });
    const totalProviders = await prisma.user.count({ where: { role: "PROVIDER" } });
    const verifiedProviders = await prisma.providerProfile.count({ where: { isVerified: true } });
    const pendingVerification = await prisma.providerProfile.count({ where: { verificationStatus: "PENDING" } });
    const totalBookings = await prisma.booking.count();
    const completedBookings = await prisma.booking.count({ where: { status: "COMPLETED" } });

    const bookingsList = await prisma.booking.findMany();
    const bookingFeeIncome = bookingsList.reduce((sum: number, b: Booking) => sum + b.bookingFee, 0);
    const commissionIncome = Math.round(bookingFeeIncome * 0.15); // 15% platform commission
    const activeUsers = await prisma.user.count();

    return NextResponse.json({
      totalCustomers,
      totalProviders,
      verifiedProviders,
      pendingVerification,
      totalBookings,
      completedBookings,
      bookingFeeIncome,
      commissionIncome,
      totalRevenue: bookingFeeIncome + commissionIncome,
      activeUsers
    });
  } catch (error: any) {
    console.error("Admin reports error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
