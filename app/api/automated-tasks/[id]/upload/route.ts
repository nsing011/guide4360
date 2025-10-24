import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.xlsx')) {
      return NextResponse.json({ error: "Only XLSX files are allowed" }, { status: 400 })
    }

    // Verify the automated task exists and belongs to the user
    const automatedTask = await prisma.automatedTask.findFirst({
      where: {
        id: params.id,
        userId: session.userId,
      },
    })

    if (!automatedTask) {
      return NextResponse.json({ error: "Automated task not found" }, { status: 404 })
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'uploads', 'automated-tasks')
    await mkdir(uploadsDir, { recursive: true })

    // Generate unique filename
    const timestamp = Date.now()
    const fileName = `${params.id}_${timestamp}_${file.name}`
    const filePath = join(uploadsDir, fileName)

    // Save file to disk
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Update the automated task with file info
    await prisma.automatedTask.update({
      where: { id: params.id },
      data: {
        uploadedFile: fileName,
        lastRun: new Date(),
      },
    })

    console.log(`XLSX file uploaded for automated task ${params.id}:`, {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      uploadedBy: session.username,
      storedAs: fileName,
    })

    return NextResponse.json({
      success: true,
      message: "XLSX file uploaded successfully",
      fileName: file.name,
      fileSize: file.size,
    })
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
  }
}
