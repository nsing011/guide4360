"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { ArrowLeft, Search, ChevronUp, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { AddPipelineModal } from "@/components/add-pipeline-modal"
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  ColumnDef,
  flexRender,
} from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"

interface Pipeline {
  id: string
  name: string
  triggerName: string
  description?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
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

export function PipelinesDashboard() {
  const router = useRouter()
  const [globalFilter, setGlobalFilter] = useState("")

  const {
    data: pipelines = [],
    error,
    mutate,
  } = useSWR<Pipeline[]>("/api/pipelines", fetcher, {
    refreshInterval: 30000,
    revalidateOnFocus: true,
    dedupingInterval: 0,
  })

  const handlePipelineAdded = () => {
    console.log("Pipeline added, revalidating...")
    mutate()
  }

  // Define columns
  const columns: ColumnDef<Pipeline>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Pipeline Name",
        size: 200,
      },
      {
        accessorKey: "triggerName",
        header: "Trigger Name",
        size: 250,
      },
      {
        accessorKey: "description",
        header: "Description",
        cell: (info) => {
          const description = info.getValue() as string | undefined
          return description ? (
            <div className="text-sm max-w-xs truncate" title={description}>
              {description}
            </div>
          ) : (
            <span className="text-muted-foreground">-</span>
          )
        },
        size: 300,
      },
      {
        accessorKey: "isActive",
        header: "Status",
        cell: (info) => {
          const isActive = info.getValue() as boolean
          return (
            <Badge variant={isActive ? "default" : "secondary"} className={isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
              {isActive ? "Active" : "Inactive"}
            </Badge>
          )
        },
        size: 120,
      },
      {
        accessorKey: "createdAt",
        header: "Created Date",
        cell: (info) => new Date(info.getValue() as string).toLocaleDateString(),
        size: 150,
      },
      {
        accessorKey: "updatedAt",
        header: "Last Updated",
        cell: (info) => new Date(info.getValue() as string).toLocaleDateString(),
        size: 150,
      },
    ],
    []
  )

  const table = useReactTable({
    data: pipelines,
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
          <h2 className="text-xl font-semibold mb-2">Error loading pipelines</h2>
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
            <h1 className="text-xl font-bold">Pipeline List</h1>
          </div>
          <AddPipelineModal onPipelineAdded={handlePipelineAdded} />
        </div>
      </header>

      {/* Search Filter */}
      <div className="px-4 sm:px-6 py-4 border-b border-border bg-card">
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Search (Trigger Name, Shift...)</label>
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
        {pipelines.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔧</div>
            <h3 className="text-lg font-semibold mb-2">No pipelines configured</h3>
            <p className="text-muted-foreground text-sm mb-6">
              Add your first pipeline to get started
            </p>
            <AddPipelineModal onPipelineAdded={handlePipelineAdded} />
          </div>
        ) : (
          <>
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
                        <div className="text-6xl mb-4">🔧</div>
                        <p className="text-lg font-semibold">No pipelines found</p>
                        <p className="text-sm">Try adjusting your search query</p>
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
                {table.getFilteredRowModel().rows.length} pipelines
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
          </>
        )}
      </div>
    </div>
  )
}
