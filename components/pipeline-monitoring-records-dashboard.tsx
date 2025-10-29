"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { ArrowLeft, Search, ChevronUp, ChevronDown, Edit2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  ColumnDef,
  flexRender,
} from "@tanstack/react-table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface PipelineMonitoringRecord {
  id: string
  monitoringDate: string
  shiftIST: string
  adfPipelineName: string
  adfTriggerName?: string
  adfPipelineRunId?: string
  overallDurationHoursMins?: string
  overallExecutionStatus?: string
  monitoredBy?: string
  ifFailedAdfRerunId?: string
  snowIncidentNumber?: string
  failureHandled?: string
  postResolveDataLoadChecked?: string
  additionalComments?: string
  createdAt: string
  updatedAt: string
}

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error("Failed to fetch")
  return res.json()
}

const statusColorMap: { [key: string]: string } = {
  SUCCESS: "bg-green-100 text-green-800",
  FAILED: "bg-red-100 text-red-800",
  RUNNING: "bg-yellow-100 text-yellow-800",
  PENDING: "bg-blue-100 text-blue-800",
  NOT_STARTED: "bg-gray-100 text-gray-800",
}

export function PipelineMonitoringRecordsDashboard() {
  const router = useRouter()
  const [globalFilter, setGlobalFilter] = useState("")
  const [editingRecord, setEditingRecord] = useState<PipelineMonitoringRecord | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isCreatingShiftRecords, setIsCreatingShiftRecords] = useState(false)
  const [selectedShiftForCreation, setSelectedShiftForCreation] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const { data: records = [], mutate } = useSWR<PipelineMonitoringRecord[]>("/api/pipeline-monitoring-records", fetcher, {
    refreshInterval: 30000,
    revalidateOnFocus: true,
  })

  const handleEditRecord = (record: PipelineMonitoringRecord) => {
    setEditingRecord(record)
    setIsEditDialogOpen(true)
  }

  const handleSaveRecord = async () => {
    if (!editingRecord) return
    setIsSaving(true)
    try {
      const response = await fetch(`/api/pipeline-monitoring-records/${editingRecord.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingRecord),
      })

      if (response.ok) {
        toast.success("Record updated successfully")
        setIsEditDialogOpen(false)
        mutate()
      } else {
        toast.error("Failed to update record")
      }
    } catch (error) {
      toast.error("Error updating record")
    } finally {
      setIsSaving(false)
    }
  }

  const handleCreateShiftRecords = async () => {
    if (!selectedShiftForCreation) return
    setIsSaving(true)
    try {
      const response = await fetch("/api/pipeline-monitoring-records/create-shift", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shift: selectedShiftForCreation,
          monitoringDate: new Date().toISOString(),
        }),
      })

      if (response.ok) {
        const data = await response.json()
        toast.success(`${data.recordsCount} records created for ${selectedShiftForCreation} shift`)
        setIsCreatingShiftRecords(false)
        setSelectedShiftForCreation("")
        mutate()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || "Failed to create shift records")
      }
    } catch (error) {
      console.error("Error creating shift records:", error)
      toast.error("Error creating shift records")
    } finally {
      setIsSaving(false)
    }
  }

  // Define columns
  const columns: ColumnDef<PipelineMonitoringRecord>[] = useMemo(
    () => [
      {
        accessorKey: "monitoringDate",
        header: "Monitoring Date",
        cell: (info) => new Date(info.getValue() as string).toLocaleDateString(),
        size: 120,
      },
      {
        accessorKey: "shiftIST",
        header: "Shift IST",
        cell: (info) => {
          const shift = info.getValue() as string
          return <span className="font-semibold text-blue-600">{shift}</span>
        },
        size: 100,
      },
      {
        accessorKey: "adfPipelineName",
        header: "ADF Pipeline Name",
        size: 200,
      },
      {
        accessorKey: "adfTriggerName",
        header: "ADF Trigger Name",
        cell: (info) => info.getValue() || "-",
        size: 180,
      },
      {
        accessorKey: "adfPipelineRunId",
        header: "ADF Pipeline Run ID",
        cell: (info) => info.getValue() || "-",
        size: 180,
      },
      {
        accessorKey: "overallDurationHoursMins",
        header: "Duration (HH:MM:SS)",
        cell: (info) => info.getValue() || "-",
        size: 150,
      },
      {
        accessorKey: "overallExecutionStatus",
        header: "Execution Status",
        cell: (info) => {
          const status = info.getValue() as string | undefined
          return status ? (
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColorMap[status] || "bg-gray-100"}`}>
              {status}
            </span>
          ) : (
            <span className="text-muted-foreground">-</span>
          )
        },
        size: 140,
      },
      {
        accessorKey: "monitoredBy",
        header: "Monitored By",
        cell: (info) => info.getValue() || "-",
        size: 130,
      },
      {
        accessorKey: "ifFailedAdfRerunId",
        header: "If Failed - Re-run ID",
        cell: (info) => info.getValue() || "-",
        size: 150,
      },
      {
        accessorKey: "snowIncidentNumber",
        header: "SNOW Incident #",
        cell: (info) => info.getValue() || "-",
        size: 140,
      },
      {
        accessorKey: "failureHandled",
        header: "Failure Handled",
        cell: (info) => info.getValue() || "-",
        size: 120,
      },
      {
        accessorKey: "postResolveDataLoadChecked",
        header: "Post Resolve Data Load",
        cell: (info) => info.getValue() || "-",
        size: 140,
      },
      {
        accessorKey: "additionalComments",
        header: "Comments",
        cell: (info) => {
          const comment = info.getValue() as string | undefined
          return comment ? (
            <div className="text-xs max-w-xs truncate" title={comment}>
              {comment}
            </div>
          ) : (
            <span className="text-muted-foreground">-</span>
          )
        },
        size: 150,
      },
      {
        id: "actions",
        header: "Actions",
        cell: (info) => {
          const record = info.row.original
          return (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleEditRecord(record)}
              className="gap-1"
            >
              <Edit2 className="h-4 w-4" />
              Edit
            </Button>
          )
        },
        size: 100,
      },
    ],
    []
  )

  const table = useReactTable({
    data: records,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="flex items-center justify-between px-4 sm:px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.push("/")} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <h1 className="text-xl font-bold">Pipeline Monitoring Records</h1>
          </div>
          <Button onClick={() => setIsCreatingShiftRecords(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Shift Records
          </Button>
        </div>
      </header>

      {/* Search Filter */}
      <div className="px-4 sm:px-6 py-4 border-b border-border bg-card">
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Search</label>
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
            <Button variant="outline" onClick={() => setGlobalFilter("")}>
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
                      <td key={cell.id} className="px-4 py-3" style={{ width: cell.column.getSize() }}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-12 text-center text-muted-foreground">
                    <p className="text-lg font-semibold">No monitoring records</p>
                    <p className="text-sm">Create shift records to get started</p>
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
            {table.getFilteredRowModel().rows.length}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
              Previous
            </Button>
            <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Pipeline Monitoring Record</DialogTitle>
            <DialogDescription>Update the monitoring details for this pipeline</DialogDescription>
          </DialogHeader>

          {editingRecord && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>ADF Pipeline Name</Label>
                  <Input value={editingRecord.adfPipelineName} disabled className="bg-muted" />
                </div>
                <div className="grid gap-2">
                  <Label>Shift IST</Label>
                  <Input value={editingRecord.shiftIST} disabled className="bg-muted" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>ADF Trigger Name</Label>
                  <Input
                    value={editingRecord.adfTriggerName || ""}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>ADF Pipeline Run ID</Label>
                  <Input
                    value={editingRecord.adfPipelineRunId || ""}
                    onChange={(e) => setEditingRecord({ ...editingRecord, adfPipelineRunId: e.target.value })}
                    placeholder="Enter run ID"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Overall Duration</Label>
                  <Input
                    value={editingRecord.overallDurationHoursMins || ""}
                    onChange={(e) => setEditingRecord({ ...editingRecord, overallDurationHoursMins: e.target.value })}
                    placeholder="HH:MM:SS"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Execution Status</Label>
                  <Select value={editingRecord.overallExecutionStatus || ""} onValueChange={(value) => setEditingRecord({ ...editingRecord, overallExecutionStatus: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SUCCESS">SUCCESS</SelectItem>
                      <SelectItem value="FAILED">FAILED</SelectItem>
                      <SelectItem value="RUNNING">RUNNING</SelectItem>
                      <SelectItem value="PENDING">PENDING</SelectItem>
                      <SelectItem value="NOT_STARTED">NOT_STARTED</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Monitored By</Label>
                  <Input
                    value={editingRecord.monitoredBy || ""}
                    onChange={(e) => setEditingRecord({ ...editingRecord, monitoredBy: e.target.value })}
                    placeholder="Your name"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>If Failed - Re-run ID</Label>
                  <Input
                    value={editingRecord.ifFailedAdfRerunId || ""}
                    onChange={(e) => setEditingRecord({ ...editingRecord, ifFailedAdfRerunId: e.target.value })}
                    placeholder="Enter re-run ID"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>SNOW Incident Number</Label>
                  <Input
                    value={editingRecord.snowIncidentNumber || ""}
                    onChange={(e) => setEditingRecord({ ...editingRecord, snowIncidentNumber: e.target.value })}
                    placeholder="INC123456"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Failure Handled</Label>
                  <Select value={editingRecord.failureHandled || ""} onValueChange={(value) => setEditingRecord({ ...editingRecord, failureHandled: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="YES">YES</SelectItem>
                      <SelectItem value="NO">NO</SelectItem>
                      <SelectItem value="PARTIAL">PARTIAL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Post Resolve Data Load Checked</Label>
                <Select value={editingRecord.postResolveDataLoadChecked || ""} onValueChange={(value) => setEditingRecord({ ...editingRecord, postResolveDataLoadChecked: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="YES">YES</SelectItem>
                    <SelectItem value="NO">NO</SelectItem>
                    <SelectItem value="NOT_APPLICABLE">NOT_APPLICABLE</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Additional Comments</Label>
                <Textarea
                  value={editingRecord.additionalComments || ""}
                  onChange={(e) => setEditingRecord({ ...editingRecord, additionalComments: e.target.value })}
                  placeholder="Add any additional information"
                  rows={4}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveRecord} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Shift Records Dialog */}
      <Dialog open={isCreatingShiftRecords} onOpenChange={setIsCreatingShiftRecords}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Shift Records</DialogTitle>
            <DialogDescription>Select a shift to create monitoring records for all pipelines</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Select Shift</Label>
              <Select value={selectedShiftForCreation} onValueChange={setSelectedShiftForCreation}>
                <SelectTrigger>
                  <SelectValue placeholder="Select shift" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">A Shift (6:30 AM - 3:00 PM IST)</SelectItem>
                  <SelectItem value="B">B Shift (2:20 PM - 11:00 PM IST)</SelectItem>
                  <SelectItem value="C">C Shift (10:30 PM - 7:00 AM IST)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreatingShiftRecords(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateShiftRecords} disabled={isSaving || !selectedShiftForCreation}>
              {isSaving ? "Creating..." : "Create Records"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
