import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const recordData = await request.json()

    // Verify the record belongs to the user
    const existingRecord = await prisma.pipelineMonitoringRecord.findFirst({
      where: {
        id: params.id,
        userId: session.userId,
      },
    })

    if (!existingRecord) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 })
    }

    // Build update object with only provided fields
    const updateData: any = {}

    if (recordData.adfTriggerName !== undefined) updateData.adfTriggerName = recordData.adfTriggerName?.trim() || null
    if (recordData.adfPipelineRunId !== undefined) updateData.adfPipelineRunId = recordData.adfPipelineRunId?.trim() || null
    if (recordData.overallDurationHoursMins !== undefined) updateData.overallDurationHoursMins = recordData.overallDurationHoursMins?.trim() || null
    if (recordData.overallExecutionStatus !== undefined) updateData.overallExecutionStatus = recordData.overallExecutionStatus || null
    if (recordData.monitoredBy !== undefined) updateData.monitoredBy = recordData.monitoredBy?.trim() || null
    if (recordData.ifFailedAdfRerunId !== undefined) updateData.ifFailedAdfRerunId = recordData.ifFailedAdfRerunId?.trim() || null
    if (recordData.snowIncidentNumber !== undefined) updateData.snowIncidentNumber = recordData.snowIncidentNumber?.trim() || null
    if (recordData.failureHandled !== undefined) updateData.failureHandled = recordData.failureHandled || null
    if (recordData.postResolveDataLoadChecked !== undefined) updateData.postResolveDataLoadChecked = recordData.postResolveDataLoadChecked || null
    if (recordData.additionalComments !== undefined) updateData.additionalComments = recordData.additionalComments?.trim() || null

    updateData.updatedAt = new Date()

    const updatedRecord = await prisma.pipelineMonitoringRecord.update({
      where: { id: params.id },
      data: updateData,
    })

    return NextResponse.json(updatedRecord)
  } catch (error) {
    console.error("Error updating pipeline monitoring record:", error)
    return NextResponse.json({ error: "Failed to update record" }, { status: 500 })
  }
}
