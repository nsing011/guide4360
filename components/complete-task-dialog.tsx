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
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface CompleteTaskDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (userName: string) => void
  taskName: string
  isCompleting: boolean
}

export function CompleteTaskDialog({
  isOpen,
  onClose,
  onConfirm,
  taskName,
  isCompleting,
}: CompleteTaskDialogProps) {
  const [userName, setUserName] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (userName.trim()) {
      onConfirm(userName.trim())
      setUserName("")
    }
  }

  const handleClose = () => {
    setUserName("")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isCompleting ? "Mark Task as Complete" : "Mark Task as Pending"}
            </DialogTitle>
            <DialogDescription>
              {isCompleting
                ? `Please enter your name to mark "${taskName}" as complete.`
                : `Please enter your name to mark "${taskName}" as pending.`}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="userName" className="text-right">
                Your Name
              </Label>
              <Input
                id="userName"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="col-span-3"
                placeholder="Enter your name"
                required
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!userName.trim()}>
              {isCompleting ? "Mark Complete" : "Mark Pending"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
