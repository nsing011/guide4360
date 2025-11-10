"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus } from "lucide-react"
import { toast } from "sonner"

interface AddPipelineMonitoringModalProps {
  onRecordAdded: () => void
}

export function AddPipelineMonitoringModal({ onRecordAdded }: AddPipelineMonitoringModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [triggerType, setTriggerType] = useState<"failed" | "fresh">("failed")
  const [formData, setFormData] = useState({
    handledShift: "",
    failureShift: "",
    triggerName: "",
    runId: "",
    status: "",
    monitoredBy: "",
    reRunId: "",
    incNumber: "",
    currentStatus: "",
    resolvedBy: "",
    resolvedByUser: "",
    workingTeam: "",
    comments: "",
    adfName: "",
    adfUrl: "",
    failedAdfUrl: "",
    reRunAdfUrl: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation for failed triggers
    if (triggerType === "failed") {
      if (!formData.failureShift || !formData.triggerName || !formData.runId || !formData.status || !formData.monitoredBy) {
        toast.error("Please fill in all required fields for failed triggers")
        return
      }
    }
    // Validation for fresh triggers
    else {
      if (!formData.triggerName || !formData.runId || !formData.status || !formData.monitoredBy) {
        toast.error("Please fill in all required fields for fresh triggers")
        return
      }
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/pipeline-monitoring", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          triggerType,
          ...formData,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Monitoring record added successfully")
        console.log("Record added successfully:", data)
        setFormData({
          handledShift: "",
          failureShift: "",
          triggerName: "",
          runId: "",
          status: "",
          monitoredBy: "",
          reRunId: "",
          incNumber: "",
          currentStatus: "",
          resolvedBy: "",
          resolvedByUser: "",
          workingTeam: "",
          comments: "",
          adfName: "",
          adfUrl: "",
          failedAdfUrl: "",
          reRunAdfUrl: "",
        })
        setTriggerType("failed")
        setIsOpen(false)
        onRecordAdded()
      } else {
        console.error("Server error:", data)
        toast.error(data.error || "Failed to add monitoring record")
      }
    } catch (error) {
      console.error("Network/parsing error:", error)
      toast.error("Failed to add monitoring record")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Record
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Pipeline Monitoring Record</DialogTitle>
            <DialogDescription>
              Log a pipeline monitoring record including failure details and resolution status.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
            {/* Trigger Type Selection */}
            <div>
              <h3 className="font-semibold text-sm mb-3 text-muted-foreground">Trigger Type</h3>
              <div className="grid gap-2">
                <Label htmlFor="triggerType">Type *</Label>
                <Select value={triggerType} onValueChange={(value: any) => setTriggerType(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select trigger type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="failed">Failed Triggers</SelectItem>
                    <SelectItem value="fresh">Fresh Triggers</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Shift & Failure Information (only for failed triggers) */}
            {triggerType === "failed" && (
              <div className="border-t pt-4">
                <h3 className="font-semibold text-sm mb-3 text-muted-foreground">Pipeline Failure Information</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="grid gap-2">
                    <Label htmlFor="failureShift">Failure Shift *</Label>
                    <Select value={formData.failureShift} onValueChange={(value) => setFormData({ ...formData, failureShift: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select failure shift" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">A (6:30 AM - 3:00 PM IST)</SelectItem>
                        <SelectItem value="B">B (2:20 PM - 11:00 PM IST)</SelectItem>
                        <SelectItem value="C">C (10:30 PM - 7:00 AM IST)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="handledShift">Handled Shift (Optional)</Label>
                    <Select value={formData.handledShift || ""} onValueChange={(value) => setFormData({ ...formData, handledShift: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select if known" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">A (6:30 AM - 3:00 PM IST)</SelectItem>
                        <SelectItem value="B">B (2:20 PM - 11:00 PM IST)</SelectItem>
                        <SelectItem value="C">C (10:30 PM - 7:00 AM IST)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* ADF Details for Failed Triggers */}
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-sm mb-3 text-muted-foreground">ADF Details (Optional)</h3>
                  <div className="grid gap-2 mb-4">
                    <Label htmlFor="adfName">ADF Name</Label>
                    <Input
                      id="adfName"
                      value={formData.adfName}
                      onChange={(e) => setFormData({ ...formData, adfName: e.target.value })}
                      placeholder="ADF pipeline name"
                    />
                  </div>
                  <div className="grid gap-2 mb-4">
                    <Label htmlFor="failedAdfUrl">Failed ADF URL</Label>
                    <Input
                      id="failedAdfUrl"
                      value={formData.failedAdfUrl}
                      onChange={(e) => setFormData({ ...formData, failedAdfUrl: e.target.value })}
                      placeholder="https://..."
                      type="url"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="reRunAdfUrl">Re-Run ADF URL</Label>
                    <Input
                      id="reRunAdfUrl"
                      value={formData.reRunAdfUrl}
                      onChange={(e) => setFormData({ ...formData, reRunAdfUrl: e.target.value })}
                      placeholder="https://..."
                      type="url"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Handled Shift (only for fresh triggers) */}
            {triggerType === "fresh" && (
              <div className="border-t pt-4">
                <h3 className="font-semibold text-sm mb-3 text-muted-foreground">Shift Information</h3>
                <div className="grid gap-2">
                  <Label htmlFor="handledShift">Handled Shift (Optional)</Label>
                  <Select value={formData.handledShift || ""} onValueChange={(value) => setFormData({ ...formData, handledShift: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select if known" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">A (6:30 AM - 3:00 PM IST)</SelectItem>
                      <SelectItem value="B">B (2:20 PM - 11:00 PM IST)</SelectItem>
                      <SelectItem value="C">C (10:30 PM - 7:00 AM IST)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Pipeline Details */}
            <div className="border-t pt-4">
              <h3 className="font-semibold text-sm mb-3 text-muted-foreground">Pipeline Details</h3>
              <div className="grid gap-2 mb-4">
                <Label htmlFor="triggerName">Trigger Name *</Label>
                <Input
                  id="triggerName"
                  value={formData.triggerName}
                  onChange={(e) => setFormData({ ...formData, triggerName: e.target.value })}
                  placeholder="Pipeline trigger name"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="runId">Run ID *</Label>
                  <Input
                    id="runId"
                    value={formData.runId}
                    onChange={(e) => setFormData({ ...formData, runId: e.target.value })}
                    placeholder="Initial run ID"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
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

            {/* ADF Details (only for fresh triggers) */}
            {triggerType === "fresh" && (
              <div className="border-t pt-4">
                <h3 className="font-semibold text-sm mb-3 text-muted-foreground">ADF Details</h3>
                <div className="grid gap-2 mb-4">
                  <Label htmlFor="adfName">ADF Name</Label>
                  <Input
                    id="adfName"
                    value={formData.adfName}
                    onChange={(e) => setFormData({ ...formData, adfName: e.target.value })}
                    placeholder="ADF pipeline name"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="adfUrl">ADF URL</Label>
                  <Input
                    id="adfUrl"
                    value={formData.adfUrl}
                    onChange={(e) => setFormData({ ...formData, adfUrl: e.target.value })}
                    placeholder="https://..."
                    type="url"
                  />
                </div>
              </div>
            )}

            {/* Monitoring & Re-Run Info */}
            <div className="border-t pt-4">
              <h3 className="font-semibold text-sm mb-3 text-muted-foreground">Monitoring Information</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="grid gap-2">
                  <Label htmlFor="monitoredBy">Monitored By *</Label>
                  <Input
                    id="monitoredBy"
                    value={formData.monitoredBy}
                    onChange={(e) => setFormData({ ...formData, monitoredBy: e.target.value })}
                    placeholder="Your name/username"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="reRunId">Re-Run ID</Label>
                  <Input
                    id="reRunId"
                    value={formData.reRunId}
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
                    value={formData.incNumber}
                    onChange={(e) => setFormData({ ...formData, incNumber: e.target.value })}
                    placeholder="INC ticket number if created"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="currentStatus">Current Status</Label>
                  <Select value={formData.currentStatus} onValueChange={(value) => setFormData({ ...formData, currentStatus: value })}>
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
                  <Select value={formData.resolvedBy} onValueChange={(value) => setFormData({ ...formData, resolvedBy: value })}>
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
                    value={formData.resolvedByUser}
                    onChange={(e) => setFormData({ ...formData, resolvedByUser: e.target.value })}
                    placeholder="Name/username who resolved"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="workingTeam">Working Team</Label>
                <Select value={formData.workingTeam} onValueChange={(value) => setFormData({ ...formData, workingTeam: value })}>
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

            {/* Comments */}
            <div className="border-t pt-4">
              <h3 className="font-semibold text-sm mb-3 text-muted-foreground">Additional Information</h3>
              <div className="grid gap-2">
                <Label htmlFor="comments">Comments</Label>
                <Textarea
                  id="comments"
                  value={formData.comments}
                  onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                  placeholder="Add any additional information or notes"
                  rows={2}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Record"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
