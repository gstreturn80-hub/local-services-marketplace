import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

// GET: Fetch user's wallet transactions and total balance
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const transactions = await prisma.walletTransaction.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" }
    });

    const balance = transactions
      .filter(t => t.status === "COMPLETED")
      .reduce((sum, t) => sum + t.amount, 0);

    return NextResponse.json({
      balance,
      transactions
    });
  } catch (error: any) {
    console.error("Wallet GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST: Request withdrawal (Provider only)
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "PROVIDER") {
      return NextResponse.json({ error: "Unauthorized. Provider account required." }, { status: 401 });
    }

    const body = await request.json();
    const { amount } = body;

    if (!amount || parseInt(amount, 10) <= 0) {
      return NextResponse.json({ error: "Invalid amount specified" }, { status: 400 });
    }

    const withdrawVal = parseInt(amount, 10);

    // Verify current balance
    const transactions = await prisma.walletTransaction.findMany({
      where: { userId: session.userId, status: "COMPLETED" }
    });

    const currentBalance = transactions.reduce((sum, t) => sum + t.amount, 0);

    if (currentBalance < withdrawVal) {
      return NextResponse.json({ error: "Insufficient balance for withdrawal" }, { status: 400 });
    }

    // Register a pending withdrawal
    const tx = await prisma.walletTransaction.create({
      data: {
        userId: session.userId,
        amount: -withdrawVal, // negative entry
        type: "WITHDRAWAL",
        status: "COMPLETED", // auto-completed for mockup, can be PENDING in real bank transfers
        description: "Withdrawal to Bank Account / UPI ID"
      }
    });

    return NextResponse.json({ success: true, transaction: tx, balance: currentBalance - withdrawVal });
  } catch (error: any) {
    console.error("Wallet withdrawal error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
