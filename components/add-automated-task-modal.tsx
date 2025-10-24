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

interface AddAutomatedTaskModalProps {
  onTaskAdded: () => void
}

export function AddAutomatedTaskModal({ onTaskAdded }: AddAutomatedTaskModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    taskType: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      toast.error("Task name is required")
      return
    }
    if (!formData.taskType) {
      toast.error("Task type is required")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/automated-tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Automated task created successfully")
        setFormData({ name: "", description: "", taskType: "" })
        setIsOpen(false)
        onTaskAdded()
      } else {
        toast.error(data.error || "Failed to create automated task")
      }
    } catch (error) {
      toast.error("Failed to create automated task")
      console.error("Error creating automated task:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Automated Task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Automated Task</DialogTitle>
            <DialogDescription>
              Create a new automated task that can be triggered manually or scheduled.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Task Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter task name"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="taskType">Task Type</Label>
              <Select value={formData.taskType} onValueChange={(value) => setFormData({ ...formData, taskType: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select task type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="retailer_data">Retailer Data Processing</SelectItem>
                  <SelectItem value="inventory_update">Inventory Update</SelectItem>
                  <SelectItem value="sales_report">Sales Report Generation</SelectItem>
                  <SelectItem value="price_analysis">Price Analysis</SelectItem>
                  <SelectItem value="customer_data">Customer Data Processing</SelectItem>
                  <SelectItem value="financial_report">Financial Report</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter task description"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
