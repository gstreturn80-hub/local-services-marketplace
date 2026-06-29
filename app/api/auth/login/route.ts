import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { comparePassword, setSessionCookie } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;
    
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }
    
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        customerProfile: true,
        providerProfile: true,
      }
    });
    
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }
    
    const isPasswordCorrect = await comparePassword(password, user.passwordHash);
    if (!isPasswordCorrect) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }
    
    const sessionData = {
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };
    
    await setSessionCookie(sessionData);
    
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatarUrl: user.avatarUrl,
        customerProfile: user.customerProfile,
        providerProfile: user.providerProfile,
      }
    });
  } catch (error: any) {
    console.error("Login API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
