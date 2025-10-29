"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { Calendar, ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

interface Task {
  id: string
  retailer: string
  day: string
  loadType: string
  schedule: string
  scheduleDays?: string
  completed: boolean
  completedBy?: string
  completedAt?: string
  createdAt: string
  updatedAt: string
}

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error("Failed to fetch")
  return res.json()
}

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
const SCHEDULE_MAP: { [key: string]: number[] } = {
  daily: [0, 1, 2, 3, 4, 5, 6],
  "mon-fri": [1, 2, 3, 4, 5],
  "mon-sun": [1, 2, 3, 4, 5, 6, 0],
  weekly: [1], // Default to Monday
  biweekly: [1],
}

export function TaskDashboardWithCalendar() {
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const { data: tasks = [], error } = useSWR<Task[]>("/api/tasks", fetcher, {
    refreshInterval: 30000,
    revalidateOnFocus: true,
  })

  // Get day of week from selected date (0 = Sunday, 1 = Monday, etc.)
  const selectedDayOfWeek = selectedDate.getDay()
  const selectedDateFormatted = selectedDate.toISOString().split("T")[0]

  // Smart filtering: Include tasks that are scheduled for the selected day
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const scheduleToCheck = task.schedule || "daily"
      let applicableDays: number[] = []

      if (scheduleToCheck === "custom" && task.scheduleDays) {
        // Parse custom days: "mon,tue,wed" -> convert to day numbers
        const dayMap: { [key: string]: number } = {
          sun: 0,
          mon: 1,
          tue: 2,
          wed: 3,
          thu: 4,
          fri: 5,
          sat: 6,
        }
        applicableDays = task.scheduleDays.split(",").map((d) => dayMap[d.toLowerCase()] || 0)
      } else {
        applicableDays = SCHEDULE_MAP[scheduleToCheck] || SCHEDULE_MAP["daily"]
      }

      return applicableDays.includes(selectedDayOfWeek)
    })
  }, [tasks, selectedDayOfWeek])

  // Generate calendar days for month view
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const prevLastDay = new Date(year, month, 0).getDate()
    const nextDays = 7 - lastDay.getDay()

    const days = []

    // Previous month days
    for (let i = firstDay.getDay(); i > 0; i--) {
      days.push({ date: new Date(year, month, -i + 1), currentMonth: false })
    }

    // Current month days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ date: new Date(year, month, i), currentMonth: true })
    }

    // Next month days
    for (let i = 1; i <= nextDays; i++) {
      days.push({ date: new Date(year, month + 1, i), currentMonth: false })
    }

    return days
  }, [currentMonth])

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date)
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const isSelected = (date: Date) => {
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    )
  }

  const statusColorMap: { [key: string]: string } = {
    completed: "bg-green-100 text-green-800",
    pending: "bg-yellow-100 text-yellow-800",
    failed: "bg-red-100 text-red-800",
    skipped: "bg-gray-100 text-gray-800",
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="flex items-center justify-between px-4 sm:px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.push("/")} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <h1 className="text-2xl font-bold">Task Dashboard</h1>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-6">
        {/* Calendar Section */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <Calendar className="h-5 w-5" />
                <span>{currentMonth.toLocaleString("default", { month: "long", year: "numeric" })}</span>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={handlePrevMonth}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={handleNextMonth}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {/* Day headers */}
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                  <div key={day} className="text-center font-semibold text-xs text-muted-foreground">
                    {day}
                  </div>
                ))}

                {/* Calendar days */}
                {calendarDays.map((day, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectDate(day.date)}
                    className={`p-2 rounded text-sm font-medium transition-all ${
                      !day.currentMonth
                        ? "text-muted-foreground bg-muted/50"
                        : isSelected(day.date)
                          ? "bg-primary text-primary-foreground"
                          : isToday(day.date)
                            ? "bg-blue-100 text-blue-800 border border-blue-300"
                            : "hover:bg-muted"
                    }`}
                  >
                    {day.date.getDate()}
                  </button>
                ))}
              </div>
              <div className="mt-4 p-3 bg-muted rounded-lg text-sm">
                <p className="font-semibold">{selectedDate.toLocaleDateString()}</p>
                <p className="text-muted-foreground">{DAYS_OF_WEEK[selectedDayOfWeek]}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tasks Section */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Tasks for {DAYS_OF_WEEK[selectedDayOfWeek]}</CardTitle>
              <CardDescription>
                Showing {filteredTasks.length} task(s) scheduled for this day (includes tasks with matching schedules)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredTasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No tasks scheduled for {DAYS_OF_WEEK[selectedDayOfWeek]}</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {filteredTasks.map((task) => (
                    <div key={task.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">{task.retailer}</h3>
                          <p className="text-sm text-muted-foreground">{task.loadType}</p>
                        </div>
                        <Badge variant="outline">{task.schedule}</Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                        <div>
                          <span className="text-muted-foreground">Day:</span> {task.day}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Load Type:</span> {task.loadType}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t">
                        <div>
                          {task.completed ? (
                            <div>
                              <Badge className="bg-green-100 text-green-800 mb-2">Completed</Badge>
                              <div className="text-xs text-muted-foreground">
                                {task.completedBy && <p>Completed by: {task.completedBy}</p>}
                                {task.completedAt && (
                                  <p>
                                    Date: {new Date(task.completedAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
                                  </p>
                                )}
                              </div>
                            </div>
                          ) : (
                            <Badge variant="secondary">Pending</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
