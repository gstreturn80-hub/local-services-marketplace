import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding started...");

  // Clean up database
  await prisma.banner.deleteMany({});
  await prisma.walletTransaction.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.booking.deleteMany({});
  await prisma.portfolioItem.deleteMany({});
  await prisma.serviceArea.deleteMany({});
  await prisma.providerProfile.deleteMany({});
  await prisma.customerProfile.deleteMany({});
  await prisma.serviceCategory.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("Database cleared.");

  // 1. Create Banners
  await prisma.banner.createMany({
    data: [
      {
        imageUrl: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=1200&auto=format&fit=crop",
        linkUrl: "/search?category=Electrician",
        type: "OFFER",
        isActive: true,
        order: 1,
      },
      {
        imageUrl: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=1200&auto=format&fit=crop",
        linkUrl: "/search?category=House Cleaning",
        type: "BANNER",
        isActive: true,
        order: 2,
      },
      {
        imageUrl: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=1200&auto=format&fit=crop",
        linkUrl: "/search?category=Custom Painting",
        type: "ANNOUNCEMENT",
        isActive: true,
        order: 3,
      }
    ]
  });

  // 2. Create Categories
  const categories = [
    // Home Services
    { name: "Electrician", description: "All electrical installations, repairs, wiring, and appliance setup.", icon: "Zap", type: "HOME" },
    { name: "Plumber", description: "Leak repairs, pipe installations, drain cleaning, and bathroom fittings.", icon: "Droplet", type: "HOME" },
    { name: "Carpenter", description: "Furniture repair, assembly, woodwork, custom cabinets, and door fitting.", icon: "Hammer", type: "HOME" },
    { name: "Painter / Colour Contractor", description: "Professional home painting, texture coating, waterproofing, and wallpapers.", icon: "Paintbrush", type: "HOME" },
    { name: "Mason", description: "Brickwork, plastering, tiling, concrete, and structural repairs.", icon: "Grid", type: "HOME" },
    { name: "Welder", description: "Metal fabrication, structural welding, gate repair, and custom grills.", icon: "Flame", type: "HOME" },
    { name: "AC Repair", description: "AC installation, gas filling, filter cleaning, and cooling repairs.", icon: "Wind", type: "HOME" },
    { name: "CCTV Installation", description: "Security camera setup, DVR configuration, wiring, and app integration.", icon: "Shield", type: "HOME" },
    { name: "RO Repair", description: "Water purifier filter replacement, servicing, and pressure pump repairs.", icon: "RefreshCw", type: "HOME" },
    { name: "House Cleaning", description: "Deep home cleaning, kitchen cleaning, sofa cleaning, and sanitization.", icon: "Sparkles", type: "HOME" },
    
    // Creative Services
    { name: "Hand Drawn Portrait", description: "Sketch and charcoal drawings made from your favorite reference photos.", icon: "PenTool", type: "CREATIVE" },
    { name: "Custom Painting", description: "Custom canvas acrylic, oil, and watercolor art tailored to your wall.", icon: "Palette", type: "CREATIVE" },
    { name: "Flex Banner Printing", description: "High-quality flex, vinyl, and promotional signs printed to size.", icon: "Printer", type: "CREATIVE" },
    { name: "Photo Printing", description: "Digital to print photos, polaroids, and album prints on premium paper.", icon: "Image", type: "CREATIVE" },
    { name: "Photo With Frame", description: "Premium customized wood or synthetic framing for family and art prints.", icon: "Maximize", type: "CREATIVE" },
    { name: "Passport Photo Printing", description: "Standard passport size photo printing and digital delivery in minutes.", icon: "UserSquare2", type: "CREATIVE" },
  ];

  for (const cat of categories) {
    await prisma.serviceCategory.create({ data: cat });
  }
  console.log("Categories seeded.");

  // 3. Create Users
  const customerPassword = bcrypt.hashSync("password123", 10);
  const providerPassword = bcrypt.hashSync("password123", 10);
  const adminPassword = bcrypt.hashSync("adminpassword", 10);

  // Admin
  const admin = await prisma.user.create({
    data: {
      email: "admin@test.com",
      name: "Super Admin",
      passwordHash: adminPassword,
      role: "ADMIN",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop",
    }
  });

  // Customer
  const customerUser = await prisma.user.create({
    data: {
      email: "customer@test.com",
      name: "Rohan Verma",
      passwordHash: customerPassword,
      role: "CUSTOMER",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
      customerProfile: {
        create: {
          phone: "9876543200",
          address: "Flat 204, Alpine Heights, Koramangala 4th Block, Bengaluru, Karnataka",
        }
      }
    }
  });

  // Provider 1: Ramesh Kumar (Electrician - Verified)
  const p1User = await prisma.user.create({
    data: {
      email: "electrician@test.com",
      name: "Ramesh Kumar",
      passwordHash: providerPassword,
      role: "PROVIDER",
      avatarUrl: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=200&auto=format&fit=crop",
      providerProfile: {
        create: {
          mobileNumber: "9876543210",
          bio: "Certified electrical contractor with 5 years experience in domestic wiring, DB panel installations, and home appliance maintenance.",
          experience: 5,
          skills: "Electrician,AC Repair",
          bankAccount: "123456789012 SBIN0001234",
          upiId: "ramesh@oksbi",
          isVerified: true,
          verificationStatus: "APPROVED",
          aadhaarUrl: "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?q=80&w=400&auto=format&fit=crop",
          selfieUrl: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=400&auto=format&fit=crop",
          rating: 4.8,
          completedJobs: 42,
          status: "AVAILABLE",
          workingDays: "Mon,Tue,Wed,Thu,Fri,Sat",
          workingHoursStart: "09:00",
          workingHoursEnd: "18:00",
          emergencyAvailable: true,
          isFeatured: true,
          serviceAreas: {
            create: [
              { state: "Karnataka", district: "Bengaluru Urban", city: "Bengaluru", area: "Koramangala", pincode: "560034" },
              { state: "Karnataka", district: "Bengaluru Urban", city: "Bengaluru", area: "Indiranagar", pincode: "560038" }
            ]
          },
          portfolioItems: {
            create: [
              { imageUrl: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=400&auto=format&fit=crop", title: "Distribution Board Installation", type: "WORK" },
              { imageUrl: "https://images.unsplash.com/photo-1558402529-d2638a7023ef?q=80&w=400&auto=format&fit=crop", title: "Home Automation Electrical Setup", type: "WORK" }
            ]
          }
        }
      }
    }
  });

  // Provider 2: Amit Sharma (Painter - Verified)
  const p2User = await prisma.user.create({
    data: {
      email: "painter@test.com",
      name: "Amit Sharma",
      passwordHash: providerPassword,
      role: "PROVIDER",
      avatarUrl: "https://images.unsplash.com/photo-1562788869-4ed32648eb72?q=80&w=200&auto=format&fit=crop",
      providerProfile: {
        create: {
          mobileNumber: "9876543211",
          bio: "Specialist in interior wall painting, texture finishes, waterproofing and exterior protective coating. 8+ years of expertise.",
          experience: 8,
          skills: "Painter / Colour Contractor,Custom Painting",
          bankAccount: "987654321098 HDFC0000001",
          upiId: "amit@okhdfc",
          isVerified: true,
          verificationStatus: "APPROVED",
          aadhaarUrl: "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?q=80&w=400&auto=format&fit=crop",
          selfieUrl: "https://images.unsplash.com/photo-1562788869-4ed32648eb72?q=80&w=400&auto=format&fit=crop",
          rating: 4.6,
          completedJobs: 89,
          status: "AVAILABLE",
          workingDays: "Mon,Tue,Wed,Thu,Fri,Sat,Sun",
          workingHoursStart: "08:00",
          workingHoursEnd: "19:00",
          emergencyAvailable: false,
          isFeatured: true,
          serviceAreas: {
            create: [
              { state: "Karnataka", district: "Bengaluru Urban", city: "Bengaluru", area: "HSR Layout", pincode: "560102" },
              { state: "Karnataka", district: "Bengaluru Urban", city: "Bengaluru", area: "Koramangala", pincode: "560034" }
            ]
          },
          portfolioItems: {
            create: [
              { imageUrl: "https://images.unsplash.com/photo-1562788869-4ed32648eb72?q=80&w=400&auto=format&fit=crop", title: "Living Room Accent Wall", type: "WORK" }
            ]
          }
        }
      }
    }
  });

  // Provider 3: Vijay Singh (Plumber - Pending Verification)
  const p3User = await prisma.user.create({
    data: {
      email: "plumber@test.com",
      name: "Vijay Singh",
      passwordHash: providerPassword,
      role: "PROVIDER",
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop",
      providerProfile: {
        create: {
          mobileNumber: "9876543212",
          bio: "Experienced technician in domestic plumbing systems, water pumps, pipe layouts, and kitchen/bathroom leakages.",
          experience: 3,
          skills: "Plumber",
          bankAccount: "555544443333 SBIN0004567",
          upiId: "vijay@okpay",
          isVerified: false,
          verificationStatus: "PENDING",
          aadhaarUrl: "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?q=80&w=400&auto=format&fit=crop",
          selfieUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop",
          rating: 0.0,
          completedJobs: 0,
          status: "OFFLINE",
          workingDays: "Mon,Tue,Wed,Thu,Fri",
          workingHoursStart: "10:00",
          workingHoursEnd: "17:00",
          serviceAreas: {
            create: [
              { state: "Karnataka", district: "Bengaluru Urban", city: "Bengaluru", area: "Koramangala", pincode: "560034" }
            ]
          }
        }
      }
    }
  });

  console.log("Users and Providers seeded.");

  // 4. Create a past completed booking & review
  const booking1 = await prisma.booking.create({
    data: {
      customerId: customerUser.id,
      providerId: p1User.id,
      serviceName: "Electrician",
      date: "2026-06-25",
      time: "10:00",
      address: "Flat 204, Alpine Heights, Koramangala 4th Block, Bengaluru, Karnataka",
      notes: "Fix living room ceiling fan speed regulator",
      bookingFee: 49,
      paymentMethod: "UPI",
      paymentStatus: "PAID",
      status: "COMPLETED",
      remainingAmount: 350,
      remainingPaymentStatus: "PAID",
      reviews: {
        create: {
          customerId: customerUser.id,
          providerId: p1User.id,
          rating: 5,
          comment: "Excellent service! Ramesh arrived on time and fixed the regulator quickly.",
        }
      }
    }
  });

  // 5. Create an active upcoming booking
  await prisma.booking.create({
    data: {
      customerId: customerUser.id,
      providerId: p1User.id,
      serviceName: "Electrician",
      date: "2026-07-02",
      time: "14:30",
      address: "Flat 204, Alpine Heights, Koramangala 4th Block, Bengaluru, Karnataka",
      notes: "Install 2 new smart switches and a tube light",
      bookingFee: 49,
      paymentMethod: "CARD",
      paymentStatus: "PAID",
      status: "ACCEPTED",
      remainingAmount: 450,
      remainingPaymentStatus: "PENDING",
    }
  });

  // 6. Create transactions for the wallet
  await prisma.walletTransaction.createMany({
    data: [
      {
        userId: p1User.id,
        amount: 350,
        type: "EARNING",
        status: "COMPLETED",
        description: "Earnings from Booking #" + booking1.id.slice(0, 8),
      },
      {
        userId: p1User.id,
        amount: -100,
        type: "WITHDRAWAL",
        status: "COMPLETED",
        description: "Withdrawal to Bank Account",
      }
    ]
  });

  console.log("Bookings and Wallet seeded.");
  console.log("Seeding complete successfully.");
}

main()
  .catch((e) => {
    console.error("Error seeding: ", e);
    process.exit(1);
  });
