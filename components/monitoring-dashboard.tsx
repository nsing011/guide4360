"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { ArrowLeft, Search, ChevronUp, ChevronDown, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { AddPipelineMonitoringModal } from "@/components/add-pipeline-monitoring-modal"
import { UpdatePipelineMonitoringModal } from "@/components/update-pipeline-monitoring-modal"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  ColumnDef,
  flexRender,
} from "@tanstack/react-table"

interface PipelineMonitoring {
  id: string
  date: string
  handledShift?: string
  failureShift: string
  triggerName: string
  runId: string
  status: string
  monitoredBy: string
  reRunId?: string
  incNumber?: string
  currentStatus?: string
  resolvedBy?: string
  resolvedByUser?: string
  workingTeam?: string
  comments?: string
  createdAt: string
}

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    const message = await res.text()
    console.error(`Fetch failed for ${url}:`, res.status, message)
    throw new Error(message || `Request failed: ${res.status}`)
  }
  const data = await res.json()
  console.log(`Fetched data from ${url}:`, data)
  return data
}

const statusColorMap: { [key: string]: string } = {
  SUCCESS: "bg-green-100 text-green-800",
  FAILED: "bg-red-100 text-red-800",
  RUNNING: "bg-yellow-100 text-yellow-800",
  SKIPPED: "bg-gray-100 text-gray-800",
}

const currentStatusColorMap: { [key: string]: string } = {
  RESOLVED: "bg-green-100 text-green-800",
  UNRESOLVED: "bg-red-100 text-red-800",
  "FAILED_AGAIN": "bg-red-100 text-red-800",
  "IN-PROGRESS": "bg-yellow-100 text-xs text-yellow-800",
  PENDING: "bg-yellow-100 text-yellow-800",
}

export function MonitoringDashboard() {
  const router = useRouter()
  const [globalFilter, setGlobalFilter] = useState("")
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [updateModalOpen, setUpdateModalOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<PipelineMonitoring | null>(null)
  const [resolutionDialogOpen, setResolutionDialogOpen] = useState(false)
  const [pendingResolutionId, setPendingResolutionId] = useState<string | null>(null)
  const [selectedTeam, setSelectedTeam] = useState<"L1" | "L2" | "OPS" | "">("")
  const [actionType, setActionType] = useState<"resolve" | "incident" | null>(null)
  const [incidentNumber, setIncidentNumber] = useState("")
  const [incidentStatus, setIncidentStatus] = useState<"UNRESOLVED" | "IN-PROGRESS" | "">("")
  const [assignedTeam, setAssignedTeam] = useState<"L1_TEAM" | "L2_TEAM" | "OPS_TEAM" | "PLATFORM_TEAM" | "">("")

  const {
    data: monitoringData = [],
    error,
    mutate,
  } = useSWR<PipelineMonitoring[]>("/api/pipeline-monitoring", fetcher, {
    refreshInterval: 30000,
    revalidateOnFocus: true,
    dedupingInterval: 0,
  })

  const handleRecordAdded = () => {
    console.log("Record added, revalidating...")
    mutate()
  }

  const openResolutionDialog = (id: string, hasIncident: boolean) => {
    setPendingResolutionId(id)
    setSelectedTeam("")
    setActionType(null)
    setIncidentNumber("")
    setIncidentStatus("")
    setAssignedTeam("")
    setResolutionDialogOpen(true)
    if (hasIncident) {
      setActionType("incident")
    }
  }

  const handleConfirmResolution = async () => {
    if (!pendingResolutionId) return

    if (actionType === "resolve") {
      if (!selectedTeam) {
        toast.error("Please select a team")
        return
      }
      setUpdatingId(pendingResolutionId)
      try {
        const response = await fetch("/api/pipeline-monitoring", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: pendingResolutionId,
            currentStatus: "RESOLVED",
            resolvedBy: selectedTeam,
          }),
        })

        if (response.ok) {
          const teamName = { L1: "L1 Team", L2: "L2 Team", OPS: "OPS Team" }[selectedTeam] || selectedTeam
          toast.success(`Pipeline marked as resolved by ${teamName}`)
          mutate()
          setResolutionDialogOpen(false)
        } else {
          const data = await response.json()
          toast.error(data.error || "Failed to update status")
        }
      } catch (error) {
        console.error("Error updating status:", error)
        toast.error("Failed to update pipeline status")
      } finally {
        setUpdatingId(null)
        setPendingResolutionId(null)
      }
    } else if (actionType === "incident") {
      if (!incidentNumber.trim()) {
        toast.error("Please enter an incident number")
        return
      }
      if (!incidentStatus) {
        toast.error("Please select incident status")
        return
      }
      if (!assignedTeam) {
        toast.error("Please select assigned team")
        return
      }
      setUpdatingId(pendingResolutionId)
      try {
        const response = await fetch("/api/pipeline-monitoring", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: pendingResolutionId,
            incNumber: incidentNumber.trim(),
            currentStatus: incidentStatus,
            workingTeam: assignedTeam,
          }),
        })

        if (response.ok) {
          const teamName = { L1_TEAM: "L1 Team", L2_TEAM: "L2 Team", OPS_TEAM: "OPS Team", PLATFORM_TEAM: "PLATFORM Team" }[assignedTeam] || assignedTeam
          toast.success(`Incident ${incidentNumber} raised and assigned to ${teamName}`)
          mutate()
          setResolutionDialogOpen(false)
        } else {
          const data = await response.json()
          toast.error(data.error || "Failed to raise incident")
        }
      } catch (error) {
        console.error("Error raising incident:", error)
        toast.error("Failed to raise incident")
      } finally {
        setUpdatingId(null)
        setPendingResolutionId(null)
      }
    }
  }

  // Define columns
  const columns: ColumnDef<PipelineMonitoring>[] = useMemo(
    () => [
      {
        accessorKey: "date",
        header: "Date",
        cell: (info) => new Date(info.getValue() as string).toLocaleDateString(),
        size: 120,
      },
      {
        accessorKey: "failureShift",
        header: "Failure Shift",
        cell: (info) => {
          const failureShift = info.getValue() as string | undefined
          return failureShift ? (
            <span className="font-semibold text-red-600 text-sm">
              {failureShift}
            </span>
          ) : (
            <span className="text-muted-foreground text-sm">-</span>
          )
        },
        size: 100,
      },
      {
        accessorKey: "handledShift",
        header: "Handled Shift",
        cell: (info) => {
          const handledShift = info.getValue() as string | undefined
          return handledShift ? (
            <span className="font-semibold text-blue-600 text-sm">
              {handledShift}
            </span>
          ) : (
            <span className="text-muted-foreground text-sm">-</span>
          )
        },
        size: 100,
      },
      {
        accessorKey: "triggerName",
        header: "Trigger Name",
        cell: (info) => <span className="text-sm">{info.getValue()}</span>,
        size: 180,
      },
      {
        accessorKey: "runId",
        header: "Run ID",
        cell: (info) => <span className="text-sm">{info.getValue()}</span>,
        size: 140,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: (info) => {
          const status = info.getValue() as string
          return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColorMap[status] || "bg-gray-100"}`}>
              {status}
            </span>
          )
        },
        size: 130,
      },
      {
        accessorKey: "monitoredBy",
        header: "Monitored By",
        cell: (info) => <span className="text-sm">{info.getValue()}</span>,
        size: 140,
      },
      {
        accessorKey: "reRunId",
        header: "Re-Run ID",
        cell: (info) => <span className="text-sm">{info.getValue() || "-"}</span>,
        size: 140,
      },
      {
        accessorKey: "incNumber",
        header: "INC Number",
        cell: (info) => <span className="text-sm">{info.getValue() || "-"}</span>,
        size: 130,
      },
      {
        accessorKey: "currentStatus",
        header: "Current Status",
        cell: (info) => {
          const status = info.getValue() as string | undefined
          return status ? (
            <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${currentStatusColorMap[status] || "bg-gray-100"}`}>
              {status.replace(/_/g, " ")}
            </span>
          ) : (
            <span className="text-muted-foreground text-sm">-</span>
          )
        },
        size: 150,
      },
      {
        accessorKey: "resolvedBy",
        header: "Resolved By (Team)",
        cell: (info) => {
          const resolved = info.getValue() as string | undefined
          const teamMap: { [key: string]: string } = {
            L1: "L1 Team",
            L2: "L2 Team",
            OPS: "OPS Team",
          }
          return resolved ? (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
              {teamMap[resolved] || resolved}
            </span>
          ) : (
            <span className="text-muted-foreground text-sm">-</span>
          )
        },
        size: 130,
      },
      {
        accessorKey: "resolvedByUser",
        header: "Resolved By (User)",
        cell: (info) => {
          const user = info.getValue() as string | undefined
          return user ? (
            <span className="text-sm font-medium">{user}</span>
          ) : (
            <span className="text-muted-foreground text-sm">-</span>
          )
        },
        size: 130,
      },
      {
        accessorKey: "workingTeam",
        header: "Working Team",
        cell: (info) => {
          const team = info.getValue() as string | undefined
          return team ? (
            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">
              {team.replace(/_/g, " ")}
            </span>
          ) : (
            <span className="text-muted-foreground text-sm">-</span>
          )
        },
        size: 150,
      },
      {
        accessorKey: "comments",
        header: "Comments",
        cell: (info) => {
          const comment = info.getValue() as string | undefined
          return comment ? (
            <div className="text-xs max-w-xs truncate" title={comment}>
              {comment}
            </div>
          ) : (
            <span className="text-muted-foreground text-xs">-</span>
          )
        },
        size: 200,
      },
      {
        id: "actions",
        header: "Actions",
        cell: (info) => {
          const row = info.row.original
          
          return (
            <Button
              size="sm"
              variant="default"
              onClick={() => {
                setSelectedRecord(row)
                setUpdateModalOpen(true)
              }}
              disabled={updatingId === row.id}
              className="gap-1 text-xs"
            >
              <CheckCircle2 className="h-3 w-3" />
              {updatingId === row.id ? "Updating..." : "Update"}
            </Button>
          )
        },
        size: 150,
      },
    ],
    [updatingId]
  )

  const table = useReactTable({
    data: monitoringData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
  })

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Error loading monitoring data</h2>
          <p className="text-muted-foreground">Please try again later</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="flex items-center justify-between px-4 sm:px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <h1 className="text-xl font-bold">Pipeline Monitoring</h1>
          </div>
          <AddPipelineMonitoringModal onRecordAdded={handleRecordAdded} />
        </div>
      </header>

      {/* Shift Information */}
      <div className="px-4 sm:px-6 py-4 bg-muted border-b border-border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-sm">
            <span className="font-semibold">A Shift:</span> 6:30 AM - 3:00 PM IST
          </div>
          <div className="text-sm">
            <span className="font-semibold">B Shift:</span> 2:20 PM - 11:00 PM IST
          </div>
          <div className="text-sm">
            <span className="font-semibold">C Shift:</span> 10:30 PM - 7:00 AM IST
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          * 30-minute overlap between shifts for handover calls
        </p>
      </div>

      {/* Search Filter */}
      <div className="px-4 sm:px-6 py-4 border-b border-border bg-card">
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Search (Trigger, Run ID, User...)</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Type to search..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={() => setGlobalFilter("")}
            >
              Clear
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="p-4 sm:p-6">
        <div className="overflow-x-auto border border-border rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-muted border-b border-border">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left font-semibold whitespace-nowrap cursor-pointer hover:bg-muted/80"
                      onClick={header.column.getToggleSortingHandler()}
                      style={{ width: header.getSize() }}
                    >
                      <div className="flex items-center gap-2">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted() ? (
                          header.column.getIsSorted() === "desc" ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronUp className="h-4 w-4" />
                          )
                        ) : null}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-4 py-3"
                        style={{ width: cell.column.getSize() }}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-12 text-center text-muted-foreground">
                    <div className="text-6xl mb-4">📊</div>
                    <p className="text-lg font-semibold">No pipeline monitoring records</p>
                    <p className="text-sm">Add your first monitoring record to get started</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            Showing {table.getRowModel().rows.length > 0 ? table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1 : 0} to{" "}
            {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length)} of{" "}
            {table.getFilteredRowModel().rows.length} records
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      <AlertDialog open={resolutionDialogOpen} onOpenChange={setResolutionDialogOpen}>
        <AlertDialogContent className="max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {incidentNumber ? "Update Incident Status" : "Pipeline Action"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {incidentNumber 
                ? `Incident ${incidentNumber} - Update status or mark as resolved` 
                : "Choose how to handle this pipeline: mark as resolved or raise an incident"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="grid gap-4 py-4">
            {/* Action Selection */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setActionType("resolve")
                  setIncidentNumber("")
                }}
                className={`p-3 border-2 rounded-lg transition-all ${
                  actionType === "resolve"
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div className="font-semibold text-sm">✓ Mark as Resolved</div>
                <div className="text-xs text-muted-foreground mt-1">Pipeline is fixed</div>
              </button>

              {!incidentNumber && (
                <button
                  onClick={() => {
                    setActionType("incident")
                    setSelectedTeam("")
                  }}
                  className={`p-3 border-2 rounded-lg transition-all ${
                    actionType === "incident"
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <div className="font-semibold text-sm">⚠️ Raise Incident</div>
                  <div className="text-xs text-muted-foreground mt-1">Failed again, needs ticket</div>
                </button>
              )}
            </div>

            {/* Resolve Option */}
            {actionType === "resolve" && (
              <div className="grid gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <label className="text-sm font-medium">Resolved By Team *</label>
                <Select value={selectedTeam} onValueChange={(value: any) => setSelectedTeam(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select team..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="L1">L1 Team</SelectItem>
                    <SelectItem value="L2">L2 Team</SelectItem>
                    <SelectItem value="OPS">OPS Team</SelectItem>
                  </SelectContent>
                </Select>
                {selectedTeam && (
                  <div className="mt-2 p-2 bg-white rounded text-sm text-blue-900">
                    ✓ Pipeline will be marked RESOLVED by <strong>{
                      { L1: "L1 Team", L2: "L2 Team", OPS: "OPS Team" }[selectedTeam]
                    }</strong>
                  </div>
                )}
              </div>
            )}

            {/* Incident Option */}
            {actionType === "incident" && (
              <div className="grid gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Incident Number (INC) *</label>
                  <Input
                    placeholder="e.g., INC0001234567"
                    value={incidentNumber}
                    onChange={(e) => setIncidentNumber(e.target.value)}
                    className="bg-white"
                  />
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium">Incident Status *</label>
                  <Select value={incidentStatus} onValueChange={(value: any) => setIncidentStatus(value)}>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Select status..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UNRESOLVED">UNRESOLVED (Not started)</SelectItem>
                      <SelectItem value="IN-PROGRESS">IN-PROGRESS (Team investigating)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium">Assigned To Team *</label>
                  <Select value={assignedTeam} onValueChange={(value: any) => setAssignedTeam(value)}>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Select team..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="L1_TEAM">L1 Team</SelectItem>
                      <SelectItem value="L2_TEAM">L2 Team</SelectItem>
                      <SelectItem value="OPS_TEAM">OPS Team</SelectItem>
                      <SelectItem value="PLATFORM_TEAM">PLATFORM Team</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {incidentNumber && incidentStatus && assignedTeam && (
                  <div className="mt-2 p-2 bg-white rounded text-sm text-orange-900 border border-orange-300">
                    <div>⚠️ <strong>INC:</strong> {incidentNumber}</div>
                    <div>📊 <strong>Status:</strong> {incidentStatus.replace(/_/g, " ")}</div>
                    <div>👥 <strong>Assigned:</strong> {{ L1_TEAM: "L1 Team", L2_TEAM: "L2 Team", OPS_TEAM: "OPS Team", PLATFORM_TEAM: "PLATFORM Team" }[assignedTeam]}</div>
                  </div>
                )}
              </div>
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setResolutionDialogOpen(false)
              setActionType(null)
              setSelectedTeam("")
              setIncidentNumber("")
              setIncidentStatus("")
              setAssignedTeam("")
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmResolution}
              disabled={
                !actionType ||
                (actionType === "resolve" && !selectedTeam) ||
                (actionType === "incident" && (!incidentNumber.trim() || !incidentStatus || !assignedTeam)) ||
                updatingId !== null
              }
              className={actionType === "resolve" ? "bg-green-600 hover:bg-green-700" : "bg-orange-600 hover:bg-orange-700"}
            >
              {updatingId ? "Updating..." : actionType === "resolve" ? "Mark Resolved" : "Raise Incident"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Update Modal */}
      <UpdatePipelineMonitoringModal
        isOpen={updateModalOpen}
        onClose={() => {
          setUpdateModalOpen(false)
          setSelectedRecord(null)
        }}
        record={selectedRecord}
        onRecordUpdated={handleRecordAdded}
      />
    </div>
  )
}
