import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || !session.userId) {
      return NextResponse.json({ error: "Unauthorized - No valid session" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const dateFrom = searchParams.get("dateFrom")
    const dateTo = searchParams.get("dateTo")
    const shift = searchParams.get("shift")
    const triggerType = searchParams.get("triggerType") || "failed" // default to "failed"

    const where: any = {}

    if (dateFrom) {
      where.date = { ...where.date, gte: new Date(dateFrom) }
    }

    if (dateTo) {
      where.date = { ...where.date, lte: new Date(dateTo) }
    }

    if (shift && ["A", "B", "C"].includes(shift)) {
      where.shift = shift
    }

    // Filter by trigger type
    if (triggerType === "failed" || triggerType === "fresh") {
      where.triggerType = triggerType
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
    if (!session || !session.userId) {
      return NextResponse.json({ error: "Unauthorized - No valid session" }, { status: 401 })
    }

    // Verify user exists in database
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
    })

    if (!user) {
      console.warn(`User ${session.userId} has valid session but not found in database. Session may be stale.`)
      return NextResponse.json({ 
        error: "Session expired or user not found. Please logout and login again.",
        code: "USER_NOT_FOUND_IN_DB"
      }, { status: 401 })
    }

    const {
      triggerType = "failed",
      handledShift,
      failureShift,
      triggerName,
      runId,
      status,
      monitoredBy,
      reRunId,
      incNumber,
      currentStatus,
      resolvedBy,
      resolvedByUser,
      workingTeam,
      comments,
      adfName,
      adfUrl,
      failedAdfUrl,
      reRunAdfUrl,
    } = await request.json()

    // Validate handledShift if provided (optional, will be updated by next shift user)
    if (handledShift && !["A", "B", "C"].includes(handledShift)) {
      return NextResponse.json({ error: "Handled shift must be A, B, or C if provided" }, { status: 400 })
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

    // For failed triggers: failureShift is required
    // For fresh triggers: failureShift is optional
    if (triggerType === "failed" && (!failureShift || !["A", "B", "C"].includes(failureShift))) {
      return NextResponse.json({ error: "Failure shift (A, B, or C) is required for failed triggers" }, { status: 400 })
    }

    const monitoring = await prisma.pipelineMonitoring.create({
      data: {
        date: new Date(),
        triggerType,
        handledShift: handledShift || null,
        failureShift: failureShift || null,
        triggerName: triggerName.trim(),
        runId: runId.trim(),
        status,
        monitoredBy: monitoredBy.trim(),
        reRunId: reRunId?.trim() || null,
        incNumber: incNumber?.trim() || null,
        currentStatus: currentStatus || null,
        resolvedBy: resolvedBy || null,
        resolvedByUser: resolvedByUser?.trim() || null,
        workingTeam: workingTeam || null,
        comments: comments?.trim() || null,
        adfName: adfName?.trim() || null,
        adfUrl: adfUrl?.trim() || null,
        failedAdfUrl: failedAdfUrl?.trim() || null,
        reRunAdfUrl: reRunAdfUrl?.trim() || null,
        createdBy: session.userId,
        updatedBy: session.userId,
        user: {
          connect: {
            id: session.userId,
          },
        },
      },
    })

    console.log("Pipeline monitoring record created:", monitoring)
    return NextResponse.json(monitoring)
  } catch (error) {
    console.error("Error creating monitoring record:", error)
    return NextResponse.json({ error: "Failed to create monitoring record" }, { status: 500 })
  }
}

