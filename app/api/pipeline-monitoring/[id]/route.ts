import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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

    const { handledShift, failureShift, triggerName, runId, status, monitoredBy, reRunId, incNumber, currentStatus, resolvedBy, resolvedByUser, workingTeam, comments, adfName, adfUrl, failedAdfUrl, reRunAdfUrl } = await request.json()

    // Validate required fields
    if (!params.id || !params.id.trim()) {
      return NextResponse.json({ error: "Record ID is required" }, { status: 400 })
    }

    // Verify the record exists
    const existingRecord = await prisma.pipelineMonitoring.findFirst({
      where: {
        id: params.id.trim(),
      },
    })

    if (!existingRecord) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 })
    }

    // Validate fields if provided
    if (handledShift && !["A", "B", "C"].includes(handledShift)) {
      return NextResponse.json({ error: "Handled shift must be A, B, or C if provided" }, { status: 400 })
    }

    if (currentStatus && !["RESOLVED", "UNRESOLVED", "IN-PROGRESS"].includes(currentStatus)) {
      return NextResponse.json({ error: "Valid status (RESOLVED, UNRESOLVED, IN-PROGRESS) is required" }, { status: 400 })
    }

    if (resolvedBy && !["L1", "L2", "OPS"].includes(resolvedBy)) {
      return NextResponse.json({ error: "Resolved by team must be L1, L2, or OPS if provided" }, { status: 400 })
    }

    if (workingTeam && !["L1_TEAM", "L2_TEAM", "OPS_TEAM", "PLATFORM_TEAM"].includes(workingTeam)) {
      return NextResponse.json({ error: "Valid working team (L1_TEAM, L2_TEAM, OPS_TEAM, PLATFORM_TEAM) is required" }, { status: 400 })
    }

    // Build update object - only allow updating certain fields
    const updateData: any = {
      updatedAt: new Date(),
      updatedBy: session.userId,
    }

    // Update only editable fields (freeze: failureShift, triggerName, runId, monitoredBy)
    if (handledShift !== undefined) updateData.handledShift = handledShift
    if (status !== undefined) updateData.status = status
    if (reRunId !== undefined) updateData.reRunId = reRunId?.trim() || null
    if (incNumber !== undefined) updateData.incNumber = incNumber?.trim() || null
    if (currentStatus !== undefined) updateData.currentStatus = currentStatus || null
    if (resolvedBy !== undefined) updateData.resolvedBy = resolvedBy || null
    if (resolvedByUser !== undefined) updateData.resolvedByUser = resolvedByUser?.trim() || null
    if (workingTeam !== undefined) updateData.workingTeam = workingTeam || null
    if (comments !== undefined) updateData.comments = comments?.trim() || null
    if (adfName !== undefined) updateData.adfName = adfName?.trim() || null
    if (adfUrl !== undefined) updateData.adfUrl = adfUrl?.trim() || null
    if (failedAdfUrl !== undefined) updateData.failedAdfUrl = failedAdfUrl?.trim() || null
    if (reRunAdfUrl !== undefined) updateData.reRunAdfUrl = reRunAdfUrl?.trim() || null

    const updatedMonitoring = await prisma.pipelineMonitoring.update({
      where: { id: params.id.trim() },
      data: updateData,
    })

    console.log("Pipeline monitoring record updated:", updatedMonitoring)
    return NextResponse.json(updatedMonitoring)
  } catch (error) {
    console.error("Error updating monitoring record:", error)
    return NextResponse.json({ error: "Failed to update monitoring record" }, { status: 500 })
  }
}

