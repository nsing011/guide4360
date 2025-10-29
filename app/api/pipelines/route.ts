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
      orderBy: [{ name: "asc" }, { triggerName: "asc" }],
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

    const { name, triggerName, description } = await request.json()

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Pipeline name is required" }, { status: 400 })
    }

    if (!triggerName || !triggerName.trim()) {
      return NextResponse.json({ error: "Trigger name is required" }, { status: 400 })
    }

    // Check if pipeline with this name already exists for this user
    const existing = await prisma.pipeline.findFirst({
      where: {
        name: name.trim(),
        userId: session.userId,
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: "Pipeline with this name already exists" },
        { status: 409 }
      )
    }

    const pipeline = await prisma.pipeline.create({
      data: {
        name: name.trim(),
        triggerName: triggerName.trim(),
        description: description?.trim() || null,
        userId: session.userId,
      },
    })

    return NextResponse.json(pipeline)
  } catch (error) {
    console.error("Error creating pipeline:", error)
    return NextResponse.json({ error: "Failed to create pipeline" }, { status: 500 })
  }
}
