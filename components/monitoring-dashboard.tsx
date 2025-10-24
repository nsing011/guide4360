"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { ArrowLeft, Search, ChevronUp, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { AddPipelineMonitoringModal } from "@/components/add-pipeline-monitoring-modal"
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
  shift: string
  triggerName: string
  runId: string
  status: string
  monitoredBy: string
  reRunId?: string
  incNumber?: string
  currentStatus?: string
  resolvedBy?: string
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
  FAILED_AGAIN: "bg-red-100 text-red-800",
  PENDING: "bg-yellow-100 text-yellow-800",
}

export function MonitoringDashboard() {
  const router = useRouter()
  const [globalFilter, setGlobalFilter] = useState("")

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
        accessorKey: "shift",
        header: "Shift",
        cell: (info) => {
          const shift = info.getValue() as string
          return (
            <span className="font-semibold text-blue-600">
              {shift}
            </span>
          )
        },
        size: 80,
      },
      {
        accessorKey: "triggerName",
        header: "Trigger Name",
        size: 180,
      },
      {
        accessorKey: "runId",
        header: "Run ID",
        size: 140,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: (info) => {
          const status = info.getValue() as string
          return (
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColorMap[status] || "bg-gray-100"}`}>
              {status}
            </span>
          )
        },
        size: 130,
      },
      {
        accessorKey: "monitoredBy",
        header: "Monitored By",
        size: 140,
      },
      {
        accessorKey: "reRunId",
        header: "Re-Run ID",
        cell: (info) => info.getValue() || "-",
        size: 140,
      },
      {
        accessorKey: "incNumber",
        header: "INC Number",
        cell: (info) => info.getValue() || "-",
        size: 130,
      },
      {
        accessorKey: "currentStatus",
        header: "Current Status",
        cell: (info) => {
          const status = info.getValue() as string | undefined
          return status ? (
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${currentStatusColorMap[status] || "bg-gray-100"}`}>
              {status.replace(/_/g, " ")}
            </span>
          ) : (
            <span className="text-muted-foreground">-</span>
          )
        },
        size: 150,
      },
      {
        accessorKey: "resolvedBy",
        header: "Resolved By",
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
            <span className="text-muted-foreground">-</span>
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
            <span className="text-muted-foreground">-</span>
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
            <span className="text-muted-foreground">-</span>
          )
        },
        size: 200,
      },
    ],
    []
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
    </div>
  )
}
