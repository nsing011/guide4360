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
  const [formData, setFormData] = useState({
    shift: "",
    triggerName: "",
    runId: "",
    status: "",
    monitoredBy: "",
    reRunId: "",
    incNumber: "",
    currentStatus: "",
    resolvedBy: "",
    workingTeam: "",
    comments: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.shift || !formData.triggerName || !formData.runId || !formData.status || !formData.monitoredBy) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/pipeline-monitoring", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Monitoring record added successfully")
        console.log("Record added successfully:", data)
        setFormData({
          shift: "",
          triggerName: "",
          runId: "",
          status: "",
          monitoredBy: "",
          reRunId: "",
          incNumber: "",
          currentStatus: "",
          resolvedBy: "",
          workingTeam: "",
          comments: "",
        })
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
          <div className="grid gap-4 py-4">
            {/* Required Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="shift">Shift *</Label>
                <Select value={formData.shift} onValueChange={(value) => setFormData({ ...formData, shift: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select shift" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">A (6:30 AM - 3:00 PM IST)</SelectItem>
                    <SelectItem value="B">B (2:20 PM - 11:00 PM IST)</SelectItem>
                    <SelectItem value="C">C (10:30 PM - 7:00 AM IST)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="triggerName">Trigger Name *</Label>
                <Input
                  id="triggerName"
                  value={formData.triggerName}
                  onChange={(e) => setFormData({ ...formData, triggerName: e.target.value })}
                  placeholder="Pipeline trigger name"
                  required
                />
              </div>
            </div>

            {/* Run Details */}
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

            {/* Monitoring Details */}
            <div className="grid grid-cols-2 gap-4">
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

            {/* Incident Details */}
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

            {/* Resolution Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="resolvedBy">Resolved By</Label>
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
            <div className="grid gap-2">
              <Label htmlFor="comments">Comments</Label>
              <Textarea
                id="comments"
                value={formData.comments}
                onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                placeholder="Add any additional information or notes"
                rows={3}
              />
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
