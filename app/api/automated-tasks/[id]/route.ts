import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, description, isActive } = await request.json()

    const existingTask = await prisma.automatedTask.findFirst({
      where: {
        id: params.id,
        userId: session.userId,
      },
    })

    if (!existingTask) {
      return NextResponse.json({ error: "Automated task not found" }, { status: 404 })
    }

    const updatedTask = await prisma.automatedTask.update({
      where: { id: params.id },
      data: {
        ...(name && { name: name.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(isActive !== undefined && { isActive }),
      },
    })

    return NextResponse.json(updatedTask)
  } catch (error) {
    console.error("Error updating automated task:", error)
    return NextResponse.json({ error: "Failed to update automated task" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const existingTask = await prisma.automatedTask.findFirst({
      where: {
        id: params.id,
        userId: session.userId,
      },
    })

    if (!existingTask) {
      return NextResponse.json({ error: "Automated task not found" }, { status: 404 })
    }

    await prisma.automatedTask.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting automated task:", error)
    return NextResponse.json({ error: "Failed to delete automated task" }, { status: 500 })
  }
}
