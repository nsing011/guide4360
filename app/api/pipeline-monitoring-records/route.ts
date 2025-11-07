import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const dateFrom = searchParams.get("dateFrom")
    const dateTo = searchParams.get("dateTo")
    const shift = searchParams.get("shift")

    const where: any = {}

    if (dateFrom) {
      where.monitoringDate = { ...where.monitoringDate, gte: new Date(dateFrom) }
    }

    if (dateTo) {
      where.monitoringDate = { ...where.monitoringDate, lte: new Date(dateTo) }
    }

    if (shift && ["A", "B", "C"].includes(shift)) {
      where.shiftIST = shift
    }

    const records = await prisma.pipelineMonitoringRecord.findMany({
      where,
      orderBy: { monitoringDate: "desc" },
    })

    return NextResponse.json(records)
  } catch (error) {
    console.error("Error fetching pipeline monitoring records:", error)
    return NextResponse.json({ error: "Failed to fetch records" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const recordData = await request.json()

    if (!recordData.shiftIST || !["A", "B", "C"].includes(recordData.shiftIST)) {
      return NextResponse.json({ error: "Valid shift (A, B, or C) is required" }, { status: 400 })
    }

    if (!recordData.adfPipelineName || !recordData.adfPipelineName.trim()) {
      return NextResponse.json({ error: "ADF Pipeline Name is required" }, { status: 400 })
    }

    const record = await prisma.pipelineMonitoringRecord.create({
      data: {
        monitoringDate: recordData.monitoringDate ? new Date(recordData.monitoringDate) : new Date(),
        shiftIST: recordData.shiftIST,
        adfPipelineName: recordData.adfPipelineName.trim(),
        adfTriggerName: recordData.adfTriggerName?.trim() || null,
        adfPipelineRunId: recordData.adfPipelineRunId?.trim() || null,
        overallDurationHoursMins: recordData.overallDurationHoursMins?.trim() || null,
        overallExecutionStatus: recordData.overallExecutionStatus || null,
        monitoredBy: recordData.monitoredBy?.trim() || null,
        ifFailedAdfRerunId: recordData.ifFailedAdfRerunId?.trim() || null,
        snowIncidentNumber: recordData.snowIncidentNumber?.trim() || null,
        failureHandled: recordData.failureHandled || null,
        postResolveDataLoadChecked: recordData.postResolveDataLoadChecked || null,
        additionalComments: recordData.additionalComments?.trim() || null,
      },
    })

    return NextResponse.json(record, { status: 201 })
  } catch (error: any) {
    console.error("Error creating pipeline monitoring record:", error)
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Record already exists for this date, shift, and pipeline" }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to create record" }, { status: 500 })
  }
}
