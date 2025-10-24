"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { ArrowLeft, Upload, Play, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { AddAutomatedTaskModal } from "@/components/add-automated-task-modal"

interface AutomatedTask {
  id: string
  name: string
  description?: string
  taskType: string
  isActive: boolean
  lastRun?: string
  nextRun?: string
  uploadedFile?: string
  createdAt: string
  updatedAt: string
}

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    const message = await res.text()
    throw new Error(message || `Request failed: ${res.status}`)
  }
  return res.json()
}

export function AutomatedTasksDashboard() {
  const router = useRouter()
  const [selectedFiles, setSelectedFiles] = useState<{ [taskId: string]: File | null }>({})

  const {
    data: automatedTasks = [],
    error,
    mutate,
  } = useSWR<AutomatedTask[]>("/api/automated-tasks", fetcher, {
    refreshInterval: 30000,
  })

  const handleFileUpload = (taskId: string, file: File) => {
    // Validate file type
    if (!file.name.toLowerCase().endsWith('.xlsx')) {
      toast.error("Please upload an XLSX file")
      return
    }

    const formData = new FormData()
    formData.append("file", file)
    formData.append("taskId", taskId)

    fetch(`/api/automated-tasks/${taskId}/upload`, {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          toast.success("XLSX file uploaded successfully")
          setSelectedFiles({ ...selectedFiles, [taskId]: null })
          mutate()
        } else {
          toast.error(data.error || "Failed to upload file")
        }
      })
      .catch((error) => {
        toast.error("Failed to upload file")
        console.error("Upload error:", error)
      })
  }

  const handleTrigger = async (taskId: string, taskType: string) => {
    try {
      const response = await fetch(`/api/automated-tasks/${taskId}/trigger`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ taskType }),
      })
      
      if (response.ok) {
        // Handle file download
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `processed_${taskType}_${new Date().toISOString().split('T')[0]}.xlsx`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        
        toast.success("Task completed! File downloaded.")
        mutate()
      } else {
        const data = await response.json()
        toast.error(data.error || "Failed to trigger task")
      }
    } catch (error) {
      toast.error("Failed to trigger task")
      console.error("Trigger error:", error)
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Error loading automated tasks</h2>
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
            <h1 className="text-xl font-bold">Automated Tasks</h1>
          </div>
          <AddAutomatedTaskModal onTaskAdded={() => mutate()} />
        </div>
      </header>

      {/* Tasks Grid */}
      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {automatedTasks.map((task) => (
            <Card key={task.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{task.name}</CardTitle>
                  <Badge variant={task.isActive ? "default" : "secondary"}>
                    {task.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {task.taskType?.replace('_', ' ').toUpperCase()}
                  </Badge>
                  {task.uploadedFile && (
                    <Badge variant="secondary" className="text-xs">
                      File Ready
                    </Badge>
                  )}
                </div>
                {task.description && (
                  <p className="text-sm text-muted-foreground">{task.description}</p>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {/* File Upload */}
                <div className="space-y-2">
                  <Label htmlFor={`file-${task.id}`}>Upload XLSX File</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id={`file-${task.id}`}
                      type="file"
                      accept=".xlsx"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          setSelectedFiles({ ...selectedFiles, [task.id]: file })
                        }
                      }}
                      className="flex-1"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const file = selectedFiles[task.id]
                        if (file) {
                          handleFileUpload(task.id, file)
                        }
                      }}
                      disabled={!selectedFiles[task.id]}
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                  {task.uploadedFile && (
                    <p className="text-xs text-green-600">✓ {task.uploadedFile}</p>
                  )}
                </div>

                {/* Trigger Button */}
                <Button
                  onClick={() => handleTrigger(task.id, task.taskType)}
                  className="w-full gap-2"
                  disabled={!task.isActive || !task.uploadedFile}
                >
                  <Play className="h-4 w-4" />
                  Process & Download
                </Button>

                {/* Task Info */}
                <div className="text-xs text-muted-foreground space-y-1">
                  {task.lastRun && (
                    <p>Last run: {new Date(task.lastRun).toLocaleString()}</p>
                  )}
                  {task.nextRun && (
                    <p>Next run: {new Date(task.nextRun).toLocaleString()}</p>
                  )}
                  <p>Created: {new Date(task.createdAt).toLocaleDateString()}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {automatedTasks.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🤖</div>
            <h3 className="text-lg font-semibold mb-2">No automated tasks yet</h3>
            <p className="text-muted-foreground text-sm">
              Create your first automated task to get started
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
