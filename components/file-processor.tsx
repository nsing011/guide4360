"use client"

import { useState, useRef } from "react"
import { Upload, Download, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"

interface ProcessingProgress {
  stage: string
  progress: number
}

type retailerType = "london-drugs" | "walmart-ecom"

export function FileProcessor() {
  const [file, setFile] = useState<File | null>(null)
  const [retailer, setretailer] = useState<retailerType | "">("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState<ProcessingProgress | null>(null)
  const [processedFile, setProcessedFile] = useState<Blob | null>(null)
  const [processedFileName, setProcessedFileName] = useState<string>("")
  const dropZoneRef = useRef<HTMLDivElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (dropZoneRef.current) {
      dropZoneRef.current.classList.add("border-blue-500", "bg-blue-50")
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (dropZoneRef.current) {
      dropZoneRef.current.classList.remove("border-blue-500", "bg-blue-50")
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (dropZoneRef.current) {
      dropZoneRef.current.classList.remove("border-blue-500", "bg-blue-50")
    }

    const files = e.dataTransfer.files
    if (files.length > 0) {
      const droppedFile = files[0]
      validateAndSetFile(droppedFile)
    }
  }

  const validateAndSetFile = (file: File) => {
    const validExtensions = ["xlsx", "xls", "csv", "txt"]
    const fileExtension = file.name.split(".").pop()?.toLowerCase()

    if (!fileExtension || !validExtensions.includes(fileExtension)) {
      toast.error("Please upload a valid file (xlsx, xls, csv, or txt)")
      return
    }

    setFile(file)
    toast.success(`File selected: ${file.name}`)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      validateAndSetFile(files[0])
    }
  }

  const handleProceed = async () => {
    if (!file || !retailer) {
      toast.error("Please select a file and retailer")
      return
    }

    setIsProcessing(true)
    setProgress({ stage: "Preparing file...", progress: 0 })

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("retailer", retailer)

      // Create a mock progress tracker
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev && prev.progress < 90) {
            return { ...prev, progress: prev.progress + Math.random() * 20 }
          }
          return prev
        })
      }, 500)

      const response = await fetch("/api/file-processor", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to process file")
      }

      // Get the processed file
      const blob = await response.blob()
      const filename =
        response.headers
          .get("content-disposition")
          ?.split("filename=")[1]
          ?.replace(/"/g, "") || `processed_${retailer}_${Date.now()}.xlsx`

      setProcessedFile(blob)
      setProcessedFileName(filename)
      setProgress({ stage: "Completed!", progress: 100 })
      toast.success("File processed successfully!")

      // Reset after a moment
      setTimeout(() => {
        setProgress(null)
      }, 2000)
    } catch (error) {
      console.error("Processing error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to process file")
      setProgress(null)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownload = () => {
    if (processedFile) {
      const url = window.URL.createObjectURL(processedFile)
      const a = document.createElement("a")
      a.href = url
      a.download = processedFileName
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success("File downloaded successfully!")
    }
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>File Processor</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Upload and process your retailer files.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Upload Area */}
            <div className="space-y-4">
              <Label>Upload File</Label>
              <div
                ref={dropZoneRef}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center transition-colors cursor-pointer hover:border-gray-400"
              >
                <input
                  type="file"
                  onChange={handleFileInputChange}
                  className="hidden"
                  id="file-input"
                  accept=".xlsx,.xls,.csv,.txt"
                />
                <label htmlFor="file-input" className="cursor-pointer">
                  <div className="flex flex-col items-center gap-3">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Drag and drop your file here</p>
                      <p className="text-sm text-muted-foreground">or click to select</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Supported: xlsx, xls, csv, txt
                      </p>
                    </div>
                  </div>
                </label>
              </div>

              {file && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-blue-900">
                    ✓ Selected: {file.name}
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    Size: {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              )}
            </div>

            {/* retailer Selection */}
            <div className="space-y-3">
              <Label htmlFor="retailer-select">Select retailer</Label>
              <Select value={retailer} onValueChange={(value) => setretailer(value as retailerType)}>
                <SelectTrigger id="retailer-select">
                  <SelectValue placeholder="Choose a retailer..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="london-drugs">London Drugs</SelectItem>
                  <SelectItem value="walmart-ecom">Walmart ecom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Processing Progress */}
            {progress && (
              <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{progress.stage}</p>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(progress.progress)}%
                  </span>
                </div>
                <Progress value={Math.min(progress.progress, 100)} className="h-2" />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleProceed}
                disabled={!file || !retailer || isProcessing}
                className="flex-1"
              >
                {isProcessing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {isProcessing ? "Processing..." : "Proceed"}
              </Button>

              {processedFile && (
                <Button onClick={handleDownload} variant="secondary" className="flex-1 gap-2">
                  <Download className="h-4 w-4" />
                  Download Processed File
                </Button>
              )}
            </div>

            {/* retailer Info */}
            {/* <div className="bg-gray-50 p-4 rounded-lg space-y-3 text-sm">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Processing Details:</h4>
                <div className="space-y-2 text-muted-foreground">
                  <div>
                    <p className="font-medium text-gray-700">London Drugs:</p>
                    <p className="text-xs ml-2">
                      • Input: XLSX format<br />
                      • Process: Delete top 6 rows → Convert to TXT with comma separators
                    </p>
                  </div>
                  <div className="mt-2">
                    <p className="font-medium text-gray-700">Walmart ecom:</p>
                    <p className="text-xs ml-2">
                      • Input: XLS format<br />
                      • Process: Rename first 3 columns → Merge with template → Format "units" columns as decimal
                    </p>
                  </div>
                </div>
              </div>
            </div> */}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

