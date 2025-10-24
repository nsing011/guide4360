import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const automatedTasks = await prisma.automatedTask.findMany({
      where: {
        userId: session.userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(automatedTasks)
  } catch (error) {
    console.error("Error fetching automated tasks:", error)
    return NextResponse.json({ error: "Failed to fetch automated tasks" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, description, taskType } = await request.json()

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Task name is required" }, { status: 400 })
    }

    if (!taskType) {
      return NextResponse.json({ error: "Task type is required" }, { status: 400 })
    }

    const automatedTask = await prisma.automatedTask.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        taskType,
        userId: session.userId,
      },
    })

    return NextResponse.json(automatedTask)
  } catch (error) {
    console.error("Error creating automated task:", error)
    return NextResponse.json({ error: "Failed to create automated task" }, { status: 500 })
  }
}
