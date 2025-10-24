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

    const where: any = {
      userId: session.userId,
    }

    if (dateFrom) {
      where.date = { ...where.date, gte: new Date(dateFrom) }
    }

    if (dateTo) {
      where.date = { ...where.date, lte: new Date(dateTo) }
    }

    if (shift && ["A", "B", "C"].includes(shift)) {
      where.shift = shift
    }

    const monitoring = await prisma.pipelineMonitoring.findMany({
      where,
      orderBy: { date: "desc" },
    })

    return NextResponse.json(monitoring)
  } catch (error) {
    console.error("Error fetching monitoring data:", error)
    return NextResponse.json({ error: "Failed to fetch monitoring data" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const {
      shift,
      triggerName,
      runId,
      status,
      monitoredBy,
      reRunId,
      incNumber,
      currentStatus,
      resolvedBy,
      workingTeam,
      comments,
    } = await request.json()

    // Validate required fields
    if (!shift || !["A", "B", "C"].includes(shift)) {
      return NextResponse.json({ error: "Valid shift (A, B, or C) is required" }, { status: 400 })
    }

    if (!triggerName || !triggerName.trim()) {
      return NextResponse.json({ error: "Trigger name is required" }, { status: 400 })
    }

    if (!runId || !runId.trim()) {
      return NextResponse.json({ error: "Run ID is required" }, { status: 400 })
    }

    if (!status || !["SUCCESS", "FAILED", "RUNNING", "SKIPPED"].includes(status)) {
      return NextResponse.json({ error: "Valid status is required" }, { status: 400 })
    }

    if (!monitoredBy || !monitoredBy.trim()) {
      return NextResponse.json({ error: "Monitored by name is required" }, { status: 400 })
    }

    const monitoring = await prisma.pipelineMonitoring.create({
      data: {
        date: new Date(),
        shift,
        triggerName: triggerName.trim(),
        runId: runId.trim(),
        status,
        monitoredBy: monitoredBy.trim(),
        reRunId: reRunId?.trim() || null,
        incNumber: incNumber?.trim() || null,
        currentStatus: currentStatus || null,
        resolvedBy: resolvedBy || null,
        workingTeam: workingTeam || null,
        comments: comments?.trim() || null,
        userId: session.userId,
      },
    })

    console.log("Pipeline monitoring record created:", monitoring)
    return NextResponse.json(monitoring)
  } catch (error) {
    console.error("Error creating monitoring record:", error)
    return NextResponse.json({ error: "Failed to create monitoring record" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id, currentStatus, resolvedBy } = await request.json()

    // Validate required fields
    if (!id || !id.trim()) {
      return NextResponse.json({ error: "Record ID is required" }, { status: 400 })
    }

    if (!currentStatus || !["RESOLVED", "UNRESOLVED", "IN-PROGRESS"].includes(currentStatus)) {
      return NextResponse.json({ error: "Valid status (RESOLVED, UNRESOLVED, IN-PROGRESS) is required" }, { status: 400 })
    }

    // Validate resolvedBy only if currentStatus is RESOLVED
    if (currentStatus === "RESOLVED") {
      if (!resolvedBy || !["L1", "L2", "OPS"].includes(resolvedBy)) {
        return NextResponse.json({ error: "When marking as RESOLVED, resolvedBy team (L1, L2, or OPS) is required" }, { status: 400 })
      }
    }

    // Verify the record belongs to the user
    const existingRecord = await prisma.pipelineMonitoring.findFirst({
      where: {
        id: id.trim(),
        userId: session.userId,
      },
    })

    if (!existingRecord) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 })
    }

    // Update the record
    const updateData: any = {
      currentStatus,
      updatedAt: new Date(),
    }

    // Only set resolvedBy if currentStatus is RESOLVED
    if (currentStatus === "RESOLVED" && resolvedBy) {
      updateData.resolvedBy = resolvedBy
    }

    const updatedMonitoring = await prisma.pipelineMonitoring.update({
      where: { id: id.trim() },
      data: updateData,
    })

    console.log("Pipeline monitoring record updated:", updatedMonitoring)
    return NextResponse.json(updatedMonitoring)
  } catch (error) {
    console.error("Error updating monitoring record:", error)
    return NextResponse.json({ error: "Failed to update monitoring record" }, { status: 500 })
  }
}
