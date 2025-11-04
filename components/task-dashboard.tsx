"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { Search, User, ChevronDown, Filter, SortAsc, SortDesc, LogOut, Calendar, ChevronLeft, ChevronRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { TaskDetailModal } from "@/components/task-detail-modal"
import { AddTaskModal } from "@/components/add-task-modal"
import { CompleteTaskDialog } from "@/components/complete-task-dialog"
import { ThemeToggle } from "@/components/theme-toggle"
import type { Task } from "@/lib/types"

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    const message = await res.text()
    throw new Error(message || `Request failed: ${res.status}`)
  }
  return res.json()
}

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
const SCHEDULE_MAP: { [key: string]: number[] } = {
  daily: [0, 1, 2, 3, 4, 5, 6],
  "mon-fri": [1, 2, 3, 4, 5],
  "mon-sun": [1, 2, 3, 4, 5, 6, 0],
  weekly: [1],
  biweekly: [1],
}

export function TaskDashboard() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [dayFilter, setDayFilter] = useState("all")
  const [loadTypeFilter, setLoadTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("retailer")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set())
  const [user, setUser] = useState<{ username: string } | null>(null)
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false)
  const [taskToComplete, setTaskToComplete] = useState<{ id: string; name: string; completed: boolean } | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [showCalendar, setShowCalendar] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/session")
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        } else {
          router.push("/login")
        }
      } catch (error) {
        router.push("/login")
      }
    }
    checkAuth()
  }, [router])

  const {
    data: tasks = [],
    error,
    mutate,
  } = useSWR<Task[]>(
    `/api/tasks?search=${encodeURIComponent(searchQuery)}&day=${dayFilter === "calendar" ? "all" : dayFilter}`,
    fetcher,
    { refreshInterval: 30000 }, // Refresh every 30 seconds
  )

  // Keep the open modal's selectedTask in sync with the latest fetched data
  useEffect(() => {
    if (!isModalOpen || !selectedTask) return
    const updated = tasks.find((t) => t.id === selectedTask.id)
    if (updated) {
      setSelectedTask(updated)
    }
  }, [tasks, isModalOpen, selectedTask?.id])

  const safeTasks: Task[] = Array.isArray(tasks) ? tasks : []

  // Smart day-of-week filtering with schedule matching
  const selectedDayOfWeek = selectedDate.getDay()
  const selectedDateString = selectedDate.toDateString() // e.g., "Wed Oct 29 2025"
  
  const tasksForSelectedDay = safeTasks.filter((task) => {
    // Get the schedule (default to daily)
    const scheduleToCheck = (task as any).schedule && (task as any).schedule.trim() ? (task as any).schedule : "daily"
    let applicableDays: number[] = []

    if (scheduleToCheck === "custom" && (task as any).scheduleDays && (task as any).scheduleDays.trim()) {
      const dayMap: { [key: string]: number } = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 }
      applicableDays = ((task as any).scheduleDays || "").split(",").map((d: string) => dayMap[d.toLowerCase()] || 0).filter((d: number) => d !== undefined)
    } else {
      applicableDays = SCHEDULE_MAP[scheduleToCheck] || SCHEDULE_MAP["daily"]
    }

    const matches = applicableDays.includes(selectedDayOfWeek)
    console.log(`📅 Day ${selectedDayOfWeek} (${DAYS_OF_WEEK[selectedDayOfWeek]}): Task "${(task as any).retailer}" schedule="${scheduleToCheck}" days=[${applicableDays}] matches=${matches}`)
    
    // Return true if this task is scheduled for the selected day
    return matches
  })

  // Enhance tasks with completion status for the selected date
  const tasksWithStatus = tasksForSelectedDay.map((task: any) => {
    const completedDate = task.completedAt ? new Date(task.completedAt).toDateString() : null
    const isCompletedOnThisDate = completedDate === selectedDateString
    
    return {
      ...task,
      completedOnThisDate: isCompletedOnThisDate,
      statusForDate: isCompletedOnThisDate ? "completed" : "pending"
    }
  })

  // Use filtered tasks for display
  const tasksToFilter = dayFilter === "calendar" ? tasksWithStatus : safeTasks

  const filteredAndSortedTasks = tasksToFilter
    .filter((task) => {
      const matchesLoadType = loadTypeFilter === "all" || task.loadType === loadTypeFilter
      
      // In calendar mode, check date-specific completion status
      // In normal mode, check overall completion status
      let matchesStatus = true
      if (statusFilter !== "all") {
        if (dayFilter === "calendar") {
          // Calendar mode: use statusForDate (completed or pending for that date)
          matchesStatus = 
            (statusFilter === "completed" && (task as any).statusForDate === "completed") ||
            (statusFilter === "pending" && (task as any).statusForDate === "pending")
        } else {
          // Normal mode: use overall completion flag
          matchesStatus =
            (statusFilter === "completed" && task.completed) ||
            (statusFilter === "pending" && !task.completed)
        }
      }
      
      return matchesLoadType && matchesStatus
    })
    .sort((a, b) => {
      let aValue: any, bValue: any

      switch (sortBy) {
        case "retailer":
          aValue = a.retailer
          bValue = b.retailer
          break
        case "day":
          aValue = a.day
          bValue = b.day
          break
        case "fileCount":
          aValue = a.fileCount
          bValue = b.fileCount
          break
        case "updatedAt":
          aValue = new Date(a.updatedAt)
          bValue = new Date(b.updatedAt)
          break
        default:
          aValue = a.retailer
          bValue = b.retailer
      }

      if (typeof aValue === "string") {
        return sortOrder === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
      }

      return sortOrder === "asc" ? aValue - bValue : bValue - aValue
    })

  const handleViewMore = (task: Task) => {
    setSelectedTask(task)
    setIsModalOpen(true)
  }

  const handleTaskSelect = (taskId: string, checked: boolean) => {
    const newSelected = new Set(selectedTasks)
    if (checked) {
      newSelected.add(taskId)
    } else {
      newSelected.delete(taskId)
    }
    setSelectedTasks(newSelected)
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTasks(new Set(filteredAndSortedTasks.map((task) => task.id)))
    } else {
      setSelectedTasks(new Set())
    }
  }

  const handleTaskComplete = (taskId: string, completed: boolean) => {
    const task = safeTasks.find(t => t.id === taskId)
    if (task) {
      setTaskToComplete({ id: taskId, name: task.retailer, completed })
      setCompleteDialogOpen(true)
    }
  }

  const handleConfirmComplete = async (userName: string) => {
    if (!taskToComplete) return

    try {
      await fetch(`/api/tasks/${taskToComplete.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          completed: taskToComplete.completed,
          completedBy: taskToComplete.completed ? userName : null
        }),
      })
      mutate() // Refresh the data
      setCompleteDialogOpen(false)
      setTaskToComplete(null)
    } catch (error) {
      console.error("Error updating task:", error)
    }
  }

  const toggleSort = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc")
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Error loading tasks</h2>
          <p className="text-muted-foreground">Please try again later</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-6 py-4 gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 w-full sm:w-auto">
            <h1 className="text-xl font-bold">Guide4360</h1>
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search retailers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-between sm:justify-end">
            <AddTaskModal onTaskAdded={() => mutate()} />
            <Button 
              variant="outline" 
              onClick={() => router.push("/automated-tasks")}
              className="gap-2 bg-transparent"
            >
              <span className="hidden sm:inline">Automated Tasks</span>
              <span className="sm:hidden">Auto</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={() => router.push("/pipelines")}
              className="gap-2 bg-transparent"
            >
              <span className="hidden sm:inline">Pipelines</span>
              <span className="sm:hidden">Pipes</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={() => router.push("/monitoring")}
              className="gap-2 bg-transparent"
            >
              <span className="hidden sm:inline">Monitoring</span>
              <span className="sm:hidden">Monitor</span>
            </Button>
            <Badge variant="outline" className="hidden sm:inline-flex">
              {selectedTasks.size} selected
            </Badge>
            <ThemeToggle />
            <div className="border-b bg-card">
              <Button variant="outline" onClick={handleLogout} className="gap-2 bg-transparent">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Enhanced Filters */}
      <div className="px-4 sm:px-6 py-4 border-b border-border">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:flex-row items-center gap-2 sm:gap-4">
          <Select value={dayFilter} onValueChange={setDayFilter}>
            <SelectTrigger className="w-full lg:w-48">
              <SelectValue placeholder="Day filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Days</SelectItem>
              <SelectItem value="Mon - Fri">Mon - Fri</SelectItem>
              <SelectItem value="Mon - Sun">Mon - Sun</SelectItem>
              <SelectItem value="Monday">Monday</SelectItem>
              <SelectItem value="Tuesday">Tuesday</SelectItem>
              <SelectItem value="Wednesday">Wednesday</SelectItem>
              <SelectItem value="Thursday">Thursday</SelectItem>
              <SelectItem value="Friday">Friday</SelectItem>
              <SelectItem value="Saturday">Saturday</SelectItem>
              <SelectItem value="Sunday">Sunday</SelectItem>
            </SelectContent>
          </Select>

          {/* Separate Calendar Filter Button */}
          <Button
            variant={dayFilter === "calendar" ? "default" : "outline"}
            size="sm"
            onClick={() => {
              // If not in calendar mode, enable it
              if (dayFilter !== "calendar") {
                setDayFilter("calendar")
              }
              // Always toggle calendar visibility
              setShowCalendar(!showCalendar)
            }}
            className="col-span-2 sm:col-span-1"
          >
            <Calendar className="h-4 w-4 mr-2" />
            {dayFilter === "calendar" ? `${selectedDate.toLocaleDateString()} (${DAYS_OF_WEEK[selectedDayOfWeek]})` : "📅 By Date"}
          </Button>

          <Select value={loadTypeFilter} onValueChange={setLoadTypeFilter}>
            <SelectTrigger className="w-full lg:w-48">
              <SelectValue placeholder="Load type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Load Types</SelectItem>
              <SelectItem value="Direct load">Direct load</SelectItem>
              <SelectItem value="Indirect load">Indirect load</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full lg:w-48">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full lg:w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="retailer">Retailer</SelectItem>
              <SelectItem value="day">Day</SelectItem>
              <SelectItem value="fileCount">File Count</SelectItem>
              <SelectItem value="updatedAt">Last Updated</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" onClick={toggleSort} className="col-span-2 sm:col-span-1 bg-transparent">
            {sortOrder === "asc" ? <SortAsc className="h-4 w-4 mr-2" /> : <SortDesc className="h-4 w-4 mr-2" />}
            <span className="sm:hidden">Sort</span>
          </Button>
        </div>
      </div>

      {/* Calendar Picker */}
      {dayFilter === "calendar" && showCalendar && (
        <div className="px-4 sm:px-6 py-4 border-b border-border bg-muted/30">
          <Card className="w-full max-w-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <Button size="sm" variant="ghost" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-semibold">{currentMonth.toLocaleString("default", { month: "long", year: "numeric" })}</span>
                <Button size="sm" variant="ghost" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-4">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                  <div key={day} className="text-center text-xs font-semibold text-muted-foreground py-2">
                    {day}
                  </div>
                ))}
                {Array.from({ length: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay() }).map((_, i) => (
                  <div key={`empty-${i}`}></div>
                ))}
                {Array.from({ length: new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate() }).map((_, i) => {
                  const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i + 1)
                  const isSelected = date.toDateString() === selectedDate.toDateString()
                  return (
                    <button
                      key={i + 1}
                      onClick={() => {
                        setSelectedDate(date)
                        setShowCalendar(false)
                      }}
                      className={`p-2 rounded text-sm font-medium transition-all ${
                        isSelected ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                      }`}
                    >
                      {i + 1}
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Task Cards */}
      <div className="p-4 sm:p-6">
        {/* Select All Header */}
        <div className="flex items-center gap-4 mb-4 p-3 sm:p-4 bg-muted/50 rounded-lg">
          <Checkbox
            checked={selectedTasks.size === filteredAndSortedTasks.length && filteredAndSortedTasks.length > 0}
            onCheckedChange={handleSelectAll}
          />
          <span className="text-sm font-medium">
            <span className="hidden sm:inline">Select All </span>({filteredAndSortedTasks.length})
          </span>
          {selectedTasks.size > 0 && (
            <Button variant="outline" size="sm" className="ml-auto bg-transparent text-xs sm:text-sm">
              Bulk Actions
            </Button>
          )}
        </div>

        <div className="space-y-4">
          {filteredAndSortedTasks.map((task) => (
            <Card key={task.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
                    <Checkbox
                      checked={selectedTasks.has(task.id)}
                      onCheckedChange={(checked) => handleTaskSelect(task.id, checked as boolean)}
                      className="mt-1 sm:mt-0"
                    />
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <h3
                          className={`font-semibold text-base sm:text-lg ${dayFilter !== "calendar" && task.completed ? "line-through text-muted-foreground" : ""}`}
                        >
                          {task.retailer}
                        </h3>
                        
                        {/* Calendar mode: Show status for selected date */}
                        {dayFilter === "calendar" && (task as any).statusForDate && (
                          <div className="flex flex-col gap-2">
                            <Badge 
                              variant="default" 
                              className={(task as any).statusForDate === "completed" ? "bg-green-500" : "bg-yellow-500"}
                            >
                              {(task as any).statusForDate === "completed" ? "Completed" : "Pending"}
                            </Badge>
                            {(task as any).completedOnThisDate && task.completedBy && (
                              <div className="text-xs text-muted-foreground">
                                <div>
                                  <span className="font-medium">By:</span> {task.completedBy}
                                </div>
                                {task.completedAt && (
                                  <div>
                                    <span className="font-medium">Time (IST):</span> {new Date(task.completedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Normal mode: Show overall completion status */}
                        {dayFilter !== "calendar" && task.completed && (
                          <div className="flex flex-col gap-2">
                            <Badge variant="default" className="bg-green-500 w-fit">
                              Completed
                            </Badge>
                            <div className="text-xs text-muted-foreground">
                              {task.completedBy && (
                                <div>
                                  <span className="font-medium">Completed by:</span> {task.completedBy}
                                </div>
                              )}
                              {task.completedAt && (
                                <div>
                                  <span className="font-medium">Date & Time (IST):</span> {new Date(task.completedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{task.day}</p>
                      <div className="text-xs sm:text-sm text-muted-foreground mt-2 sm:hidden">
                        {task.formats.xlsx} xlsx, {task.formats.csv} csv, {task.formats.txt} txt
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 w-full sm:w-auto">
                    <div className="text-sm text-muted-foreground hidden sm:block">
                      {task.formats.xlsx} xlsx, {task.formats.csv} csv, {task.formats.txt} txt, {task.formats.mail} mail
                    </div>

                    <Badge variant={task.loadType === "Direct load" ? "default" : "secondary"} className="w-fit">
                      {task.loadType}
                    </Badge>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleTaskComplete(task.id, !task.completed)}
                        className="text-xs flex-1 sm:flex-none"
                      >
                        {task.completed ? "Mark Pending" : "Mark Complete"}
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewMore(task)}
                        className="gap-2 flex-1 sm:flex-none"
                      >
                        <span className="hidden sm:inline">view more</span>
                        <span className="sm:hidden">view</span>
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredAndSortedTasks.length === 0 && (
          <div className="text-center py-12">
            <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No tasks found</h3>
            <p className="text-muted-foreground text-sm sm:text-base">Try adjusting your filters or search query</p>
          </div>
        )}
      </div>

      <TaskDetailModal
        task={selectedTask}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpdate={() => mutate()}
      />

      <CompleteTaskDialog
        isOpen={completeDialogOpen}
        onClose={() => {
          setCompleteDialogOpen(false)
          setTaskToComplete(null)
        }}
        onConfirm={handleConfirmComplete}
        taskName={taskToComplete?.name || ""}
        isCompleting={taskToComplete?.completed || false}
      />
    </div>
  )
}
