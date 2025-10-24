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

interface AddPipelineModalProps {
  onPipelineAdded: () => void
}

export function AddPipelineModal({ onPipelineAdded }: AddPipelineModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    triggerName: "",
    description: "",
    shift: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.triggerName.trim()) {
      toast.error("Trigger name is required")
      return
    }
    if (!formData.shift) {
      toast.error("Shift is required")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/pipelines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Pipeline added successfully")
        setFormData({ triggerName: "", description: "", shift: "" })
        setIsOpen(false)
        onPipelineAdded()
      } else {
        toast.error(data.error || "Failed to add pipeline")
      }
    } catch (error) {
      toast.error("Failed to add pipeline")
      console.error("Error adding pipeline:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Pipeline
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Pipeline</DialogTitle>
            <DialogDescription>
              Add a new pipeline trigger to the system. This pipeline will be available for all shifts.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="triggerName">Trigger Name</Label>
              <Input
                id="triggerName"
                value={formData.triggerName}
                onChange={(e) => setFormData({ ...formData, triggerName: e.target.value })}
                placeholder="e.g., Data_Load_Pipeline"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="shift">Shift</Label>
              <Select value={formData.shift} onValueChange={(value) => setFormData({ ...formData, shift: value })}>
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
            <div className="grid gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter pipeline description"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Pipeline"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
