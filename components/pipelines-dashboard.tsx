"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { ArrowLeft, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { AgGridReact } from "ag-grid-react"
import "ag-grid-community/styles/ag-grid.css"
import "ag-grid-community/styles/ag-theme-quartz.css"
import { AddPipelineModal } from "@/components/add-pipeline-modal"

interface Pipeline {
  id: string
  triggerName: string
  description?: string
  shift: string
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
  const [gridApi, setGridApi] = useState<any>(null)

  const {
    data: pipelines = [],
    error,
    mutate,
  } = useSWR<Pipeline[]>("/api/pipelines", fetcher, {
    refreshInterval: 30000,
    revalidateOnFocus: true,
    dedupingInterval: 0,
  })

  useEffect(() => {
    console.log("Pipelines data updated:", pipelines)
  }, [pipelines])

  const handlePipelineAdded = () => {
    console.log("Pipeline added, revalidating...")
    mutate()
  }

  const columnDefs = [
    {
      headerName: "Shift",
      field: "shift" as any,
      width: 100,
      filter: "agSetColumnFilter",
      cellStyle: { textAlign: "center", fontWeight: "bold" },
    },
    {
      headerName: "Trigger Name",
      field: "triggerName" as any,
      width: 250,
      filter: "agTextColumnFilter",
    },
    {
      headerName: "Description",
      field: "description" as any,
      width: 300,
      filter: "agTextColumnFilter",
      autoHeight: true,
      wrapText: true,
    },
    {
      headerName: "Status",
      field: "isActive" as any,
      width: 120,
      cellRenderer: (params: any) => (
        <span
          style={{
            padding: "4px 8px",
            borderRadius: "4px",
            backgroundColor: params.value ? "#10b981" : "#ef4444",
            color: "white",
            fontWeight: "bold",
          }}
        >
          {params.value ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      headerName: "Created Date",
      field: "createdAt" as any,
      width: 150,
      valueFormatter: (params: any) =>
        new Date(params.value).toLocaleDateString(),
      filter: "agDateColumnFilter",
    },
    {
      headerName: "Last Updated",
      field: "updatedAt" as any,
      width: 150,
      valueFormatter: (params: any) =>
        new Date(params.value).toLocaleDateString(),
    },
  ] as any

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
            <h1 className="text-xl font-bold">Pipelines Configuration</h1>
          </div>
          <AddPipelineModal onPipelineAdded={handlePipelineAdded} />
        </div>
      </header>

      {/* AG Grid Table */}
      <div className="p-4 sm:p-6">
        <div 
          className="ag-theme-quartz"
          style={{ 
            height: "600px", 
            width: "100%",
            display: "flex",
            flexDirection: "column"
          }}
        >
          <AgGridReact
            columnDefs={columnDefs}
            rowData={pipelines}
            pagination={true}
            paginationPageSize={15}
            enableCellTextSelection={true}
            suppressHorizontalScroll={false}
            rowBuffer={10}
            cacheBlockSize={15}
            defaultColDef={{
              sortable: true,
              resizable: true,
              floatingFilter: true,
              filter: true,
            }}
            onGridReady={(params) => {
              console.log("Pipelines grid ready with", pipelines.length, "rows")
              params.api.sizeColumnsToFit()
            }}
          />
        </div>

        {pipelines.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔧</div>
            <h3 className="text-lg font-semibold mb-2">No pipelines configured</h3>
            <p className="text-muted-foreground text-sm">
              Add your first pipeline to get started
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
