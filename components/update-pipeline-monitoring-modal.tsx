"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

interface PipelineMonitoring {
  id: string
  date: string
  triggerType?: string
  handledShift?: string
  failureShift?: string
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
  adfName?: string
  adfUrl?: string
  failedAdfUrl?: string
  reRunAdfUrl?: string
  createdAt: string
}

interface UpdatePipelineMonitoringModalProps {
  isOpen: boolean
  onClose: () => void
  record: PipelineMonitoring | null
  onRecordUpdated: () => void
}

export function UpdatePipelineMonitoringModal({
  isOpen,
  onClose,
  record,
  onRecordUpdated,
}: UpdatePipelineMonitoringModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<Partial<PipelineMonitoring>>({})

  // Initialize form data when record changes or modal opens
  useEffect(() => {
    if (isOpen && record) {
      setFormData({
        handledShift: record.handledShift || "",
        failureShift: record.failureShift || "",
        triggerName: record.triggerName || "",
        runId: record.runId || "",
        status: record.status || "",
        monitoredBy: record.monitoredBy || "",
        reRunId: record.reRunId || "",
        incNumber: record.incNumber || "",
        currentStatus: record.currentStatus || "",
        resolvedBy: record.resolvedBy || "",
        resolvedByUser: record.resolvedByUser || "",
        workingTeam: record.workingTeam || "",
        comments: record.comments || "",
        adfName: record.adfName || "",
        adfUrl: record.adfUrl || "",
        failedAdfUrl: record.failedAdfUrl || "",
        reRunAdfUrl: record.reRunAdfUrl || "",
      })
    }
  }, [isOpen, record])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!record) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/pipeline-monitoring/${record.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          handledShift: formData.handledShift || null,
          failureShift: formData.failureShift || null,
          triggerName: formData.triggerName,
          runId: formData.runId,
          status: formData.status,
          monitoredBy: formData.monitoredBy,
          reRunId: formData.reRunId || null,
          incNumber: formData.incNumber || null,
          currentStatus: formData.currentStatus || null,
          resolvedBy: formData.resolvedBy || null,
          resolvedByUser: formData.resolvedByUser || null,
          workingTeam: formData.workingTeam || null,
          comments: formData.comments || null,
          adfName: formData.adfName || null,
          adfUrl: formData.adfUrl || null,
          failedAdfUrl: formData.failedAdfUrl || null,
          reRunAdfUrl: formData.reRunAdfUrl || null,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Record updated successfully")
        onClose()
        onRecordUpdated()
      } else {
        toast.error(data.error || "Failed to update record")
      }
    } catch (error) {
      console.error("Error updating record:", error)
      toast.error("Failed to update record")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Update Pipeline Monitoring Record</DialogTitle>
            <DialogDescription>Update failure and resolution details for this pipeline</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
            {/* Shift & Failure Information */}
            <div>
              <h3 className="font-semibold text-sm mb-3 text-muted-foreground">Shift Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="failureShift">Failure Shift (Frozen)</Label>
                  <Input
                    id="failureShift"
                    value={formData.failureShift || ""}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="handledShift">Handled Shift</Label>
                  <Select
                    value={formData.handledShift || ""}
                    onValueChange={(value) => setFormData({ ...formData, handledShift: value || null })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select handled shift" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">A (6:30 AM - 3:00 PM IST)</SelectItem>
                      <SelectItem value="B">B (2:20 PM - 11:00 PM IST)</SelectItem>
                      <SelectItem value="C">C (10:30 PM - 7:00 AM IST)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Pipeline Details */}
            <div className="border-t pt-4">
              <h3 className="font-semibold text-sm mb-3 text-muted-foreground">Pipeline Details (Frozen)</h3>
              <div className="grid gap-2 mb-4">
                <Label htmlFor="triggerName">Trigger Name (Frozen)</Label>
                <Input
                  id="triggerName"
                  value={formData.triggerName || ""}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="runId">Run ID (Frozen)</Label>
                  <Input
                    id="runId"
                    value={formData.runId || ""}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status || ""} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SUCCESS">SUCCESS</SelectItem>
                      <SelectItem value="FAILED">FAILED</SelectItem>
                      <SelectItem value="RUNNING">RUNNING</SelectItem>
                      <SelectItem value="SKIPPED">SKIPPED</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Monitoring & Re-Run Info */}
            <div className="border-t pt-4">
              <h3 className="font-semibold text-sm mb-3 text-muted-foreground">Monitoring Information</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="grid gap-2">
                  <Label htmlFor="monitoredBy">Monitored By (Frozen)</Label>
                  <Input
                    id="monitoredBy"
                    value={formData.monitoredBy || ""}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="reRunId">Re-Run ID</Label>
                  <Input
                    id="reRunId"
                    value={formData.reRunId || ""}
                    onChange={(e) => setFormData({ ...formData, reRunId: e.target.value })}
                    placeholder="Re-run ID if applicable"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="incNumber">INC Number</Label>
                  <Input
                    id="incNumber"
                    value={formData.incNumber || ""}
                    onChange={(e) => setFormData({ ...formData, incNumber: e.target.value })}
                    placeholder="INC ticket number if created"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="currentStatus">Current Status</Label>
                  <Select
                    value={formData.currentStatus || ""}
                    onValueChange={(value) => setFormData({ ...formData, currentStatus: value || null })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Status after re-run" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="RESOLVED">RESOLVED</SelectItem>
                      <SelectItem value="UNRESOLVED">UNRESOLVED</SelectItem>
                      <SelectItem value="IN-PROGRESS">IN-PROGRESS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Resolution & Team Info */}
            <div className="border-t pt-4">
              <h3 className="font-semibold text-sm mb-3 text-muted-foreground">Resolution Details</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="grid gap-2">
                  <Label htmlFor="resolvedBy">Resolved By Team</Label>
                  <Select
                    value={formData.resolvedBy || ""}
                    onValueChange={(value) => setFormData({ ...formData, resolvedBy: value || null })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Resolution team" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="L1">L1 Team</SelectItem>
                      <SelectItem value="L2">L2 Team</SelectItem>
                      <SelectItem value="OPS">OPS Team</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="resolvedByUser">Resolved By User</Label>
                  <Input
                    id="resolvedByUser"
                    value={formData.resolvedByUser || ""}
                    onChange={(e) => setFormData({ ...formData, resolvedByUser: e.target.value })}
                    placeholder="Name/username who resolved"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="workingTeam">Working Team</Label>
                <Select
                  value={formData.workingTeam || ""}
                  onValueChange={(value) => setFormData({ ...formData, workingTeam: value || null })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Team status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="L1_TEAM">L1 Team</SelectItem>
                    <SelectItem value="L2_TEAM">L2 Team</SelectItem>
                    <SelectItem value="OPS_TEAM">OPS Team</SelectItem>
                    <SelectItem value="PLATFORM_TEAM">PLATFORM Team</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* ADF Details (shown for failed triggers) */}
            {record?.triggerType === "failed" && (
              <div className="border-t pt-4">
                <h3 className="font-semibold text-sm mb-3 text-muted-foreground">ADF Details</h3>
                <div className="grid gap-2 mb-4">
                  <Label htmlFor="adfName">ADF Name</Label>
                  <Input
                    id="adfName"
                    value={formData.adfName || ""}
                    onChange={(e) => setFormData({ ...formData, adfName: e.target.value })}
                    placeholder="ADF pipeline name"
                  />
                </div>
                <div className="grid gap-2 mb-4">
                  <Label htmlFor="failedAdfUrl">Failed ADF URL</Label>
                  <Input
                    id="failedAdfUrl"
                    value={formData.failedAdfUrl || ""}
                    onChange={(e) => setFormData({ ...formData, failedAdfUrl: e.target.value })}
                    placeholder="https://..."
                    type="url"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="reRunAdfUrl">Re-Run ADF URL</Label>
                  <Input
                    id="reRunAdfUrl"
                    value={formData.reRunAdfUrl || ""}
                    onChange={(e) => setFormData({ ...formData, reRunAdfUrl: e.target.value })}
                    placeholder="https://..."
                    type="url"
                  />
                </div>
              </div>
            )}

            {/* ADF Details (shown for fresh triggers) */}
            {record?.triggerType === "fresh" && (
              <div className="border-t pt-4">
                <h3 className="font-semibold text-sm mb-3 text-muted-foreground">ADF Details</h3>
                <div className="grid gap-2 mb-4">
                  <Label htmlFor="adfName">ADF Name</Label>
                  <Input
                    id="adfName"
                    value={formData.adfName || ""}
                    onChange={(e) => setFormData({ ...formData, adfName: e.target.value })}
                    placeholder="ADF pipeline name"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="adfUrl">ADF URL</Label>
                  <Input
                    id="adfUrl"
                    value={formData.adfUrl || ""}
                    onChange={(e) => setFormData({ ...formData, adfUrl: e.target.value })}
                    placeholder="https://..."
                    type="url"
                  />
                </div>
              </div>
            )}

            {/* Comments */}
            <div className="border-t pt-4">
              <h3 className="font-semibold text-sm mb-3 text-muted-foreground">Additional Information</h3>
              <div className="grid gap-2">
                <Label htmlFor="comments">Comments</Label>
                <Textarea
                  id="comments"
                  value={formData.comments || ""}
                  onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                  placeholder="Add any additional information or notes"
                  rows={2}
                />
              </div>
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Record"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

