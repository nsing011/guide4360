import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const taskData = await request.json()

    const existingTask = await prisma.task.findUnique({
      where: { id: params.id },
      include: { files: true },
    })

    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    // Only delete and recreate files if new files are provided
    const shouldUpdateFiles = taskData.files !== undefined && Array.isArray(taskData.files)

    if (shouldUpdateFiles) {
      await prisma.taskFile.deleteMany({
        where: { taskId: params.id },
      })
    }

    // Handle credential updates if provided
    const updateData: any = {
      completed: taskData.completed,
      completedBy: taskData.completedBy,
    }

    // Set completedAt when marking as complete, clear it when marking as pending
    if (taskData.completed === true) {
      updateData.completedAt = new Date()
    } else if (taskData.completed === false) {
      updateData.completedAt = null
    }

    // Only update these fields if they're provided
    if (taskData.retailer !== undefined) updateData.retailer = taskData.retailer
    if (taskData.day !== undefined) updateData.day = taskData.day
    if (taskData.fileCount !== undefined) updateData.fileCount = taskData.fileCount
    if (taskData.formats !== undefined) {
      updateData.xlsxCount = taskData.formats.xlsx || 0
      updateData.csvCount = taskData.formats.csv || 0
      updateData.txtCount = taskData.formats.txt || 0
      updateData.mailCount = taskData.formats.mail || 0
    }
    if (taskData.loadType !== undefined) updateData.loadType = taskData.loadType
    if (taskData.directLoadTiming !== undefined) {
      updateData.istTime = taskData.directLoadTiming.istTime
      updateData.estTime = taskData.directLoadTiming.estTime
      updateData.sqlQuery = taskData.directLoadTiming.sqlQuery
    }
    if (taskData.indirectLoadSource !== undefined) updateData.indirectLoadSource = taskData.indirectLoadSource
    if (taskData.retailerPortal !== undefined) {
      updateData.websiteLink = taskData.retailerPortal.websiteLink
      updateData.portalUsername = taskData.retailerPortal.username
      updateData.portalPassword = taskData.retailerPortal.password
    }
    if (taskData.retailerMail !== undefined) {
      updateData.mailFolder = taskData.retailerMail.mailFolder
      updateData.mailId = taskData.retailerMail.mailId
    }
    if (taskData.link !== undefined) updateData.link = taskData.link || ""
    if (taskData.username !== undefined) updateData.username = taskData.username || ""
    if (taskData.password !== undefined) updateData.password = taskData.password || ""
    if (taskData.ktRecordingLink !== undefined) updateData.ktRecordingLink = taskData.ktRecordingLink
    if (taskData.documentationLink !== undefined) updateData.documentationLink = taskData.documentationLink
    if (taskData.instructions !== undefined) updateData.instructions = taskData.instructions
    if (taskData.schedule !== undefined) updateData.schedule = taskData.schedule // Add schedule field
    if (taskData.scheduleDays !== undefined) updateData.scheduleDays = taskData.scheduleDays // Add scheduleDays field

    // Update credentials if provided
    if (taskData.credentials) {
      if (taskData.credentials.portalPassword !== undefined) {
        updateData.portalPassword = taskData.credentials.portalPassword
      }
      if (taskData.credentials.password !== undefined) {
        updateData.password = taskData.credentials.password
      }
      if (taskData.credentials.portalUsername !== undefined) {
        updateData.portalUsername = taskData.credentials.portalUsername
      }
      if (taskData.credentials.username !== undefined) {
        updateData.username = taskData.credentials.username
      }
    }

    // Build the update object
    const updateObject: any = {
      ...updateData,
    }

    // Only add files update if new files were provided
    if (shouldUpdateFiles) {
      updateObject.files = {
        create: taskData.files.map((file: any) => ({
          downloadName: file.downloadName,
          requiredName: file.requiredName,
        })) || [],
      }
    }

    const updatedTask = await prisma.task.update({
      where: { id: params.id },
      data: updateObject,
      include: {
        files: true,
      },
    })

    return NextResponse.json({ success: true, task: updatedTask })
  } catch (error) {
    console.error("Error updating task:", error)
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const task = await prisma.task.findUnique({
      where: { id: params.id },
    })

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    await prisma.task.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting task:", error)
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 })
  }
}
