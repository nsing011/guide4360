import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { shift, monitoringDate } = await request.json()

    if (!shift || !["A", "B", "C"].includes(shift)) {
      return NextResponse.json({ error: "Valid shift (A, B, or C) is required" }, { status: 400 })
    }

    // Get all unique pipelines
    // Fetch both name and triggerName
    const pipelines = await prisma.pipeline.findMany({
      select: { name: true, triggerName: true },
    })

    // Remove duplicates manually
    const uniquePipelines = Array.from(new Map(pipelines.map((p: { name: string; triggerName: string }) => [p.name, p])).values())

    if (uniquePipelines.length === 0) {
      return NextResponse.json({ error: "No pipelines found. Please add pipelines first." }, { status: 400 })
    }

    // Create monitoring records for each pipeline in this shift
    const date = monitoringDate ? new Date(monitoringDate) : new Date()
    const createdRecords = []
    const skippedRecords = []

    for (const pipeline of uniquePipelines as Array<{ name: string; triggerName: string }>) {
      try {
        const record = await prisma.pipelineMonitoringRecord.create({
          data: {
            monitoringDate: date,
            shiftIST: shift,
            adfPipelineName: pipeline.name,
            adfTriggerName: pipeline.triggerName, // Include trigger name
          },
        })
        createdRecords.push(record)
      } catch (error: any) {
        // Skip if record already exists for this date, shift, and pipeline
        if (error.code === "P2002") {
          skippedRecords.push(pipeline.name)
        } else {
          console.error(`Error creating record for pipeline ${pipeline.name}:`, error)
          throw error
        }
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: `Created ${createdRecords.length} monitoring records for ${shift} shift${skippedRecords.length > 0 ? ` (${skippedRecords.length} already exist)` : ""}`,
        recordsCount: createdRecords.length,
        skipped: skippedRecords.length,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("Error creating shift records:", error)
    return NextResponse.json({ error: error?.message || "Failed to create shift records" }, { status: 500 })
  }
}
