import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

// GET: List all categories, option to filter by type
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // "HOME" or "CREATIVE"
    
    const where: any = { isEnabled: true };
    if (type) {
      where.type = type;
    }

    const categories = await prisma.serviceCategory.findMany({
      where,
      orderBy: { name: "asc" }
    });

    return NextResponse.json(categories);
  } catch (error: any) {
    console.error("Categories fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST: Create a category (Admin only)
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, icon, type } = body;

    if (!name || !icon || !type) {
      return NextResponse.json({ error: "Name, icon, and type are required" }, { status: 400 });
    }

    const existing = await prisma.serviceCategory.findUnique({
      where: { name }
    });

    if (existing) {
      return NextResponse.json({ error: "Category with this name already exists" }, { status: 400 });
    }

    const category = await prisma.serviceCategory.create({
      data: {
        name,
        description: description || "",
        icon,
        type,
        isEnabled: true
      }
    });

    return NextResponse.json(category);
  } catch (error: any) {
    console.error("Category creation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT: Update a category (Admin only)
export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
    }

    const body = await request.json();
    const { id, name, description, icon, type, isEnabled } = body;

    if (!id) {
      return NextResponse.json({ error: "ID is required to update category" }, { status: 400 });
    }

    const updated = await prisma.serviceCategory.update({
      where: { id },
      data: {
        name,
        description,
        icon,
        type,
        isEnabled
      }
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Category update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE: Delete a category (Admin only)
export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required to delete category" }, { status: 400 });
    }

    await prisma.serviceCategory.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: "Category deleted successfully" });
  } catch (error: any) {
    console.error("Category deletion error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
