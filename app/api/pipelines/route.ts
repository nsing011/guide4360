import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const pipelines = await prisma.pipeline.findMany({
      where: {
        userId: session.userId,
      },
      orderBy: [{ shift: "asc" }, { triggerName: "asc" }],
    })

    return NextResponse.json(pipelines)
  } catch (error) {
    console.error("Error fetching pipelines:", error)
    return NextResponse.json({ error: "Failed to fetch pipelines" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { triggerName, description, shift } = await request.json()

    if (!triggerName || !triggerName.trim()) {
      return NextResponse.json({ error: "Trigger name is required" }, { status: 400 })
    }

    if (!shift || !["A", "B", "C"].includes(shift)) {
      return NextResponse.json({ error: "Valid shift (A, B, or C) is required" }, { status: 400 })
    }

    // Check if pipeline already exists for this shift and trigger
    const existing = await prisma.pipeline.findUnique({
      where: {
        triggerName_shift: {
          triggerName: triggerName.trim(),
          shift,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: "Pipeline with this trigger name already exists for this shift" },
        { status: 409 }
      )
    }

    const pipeline = await prisma.pipeline.create({
      data: {
        triggerName: triggerName.trim(),
        description: description?.trim() || null,
        shift,
        userId: session.userId,
      },
    })

    return NextResponse.json(pipeline)
  } catch (error) {
    console.error("Error creating pipeline:", error)
    return NextResponse.json({ error: "Failed to create pipeline" }, { status: 500 })
  }
}
