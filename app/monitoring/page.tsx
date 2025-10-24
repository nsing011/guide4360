"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { MonitoringDashboard } from "@/components/monitoring-dashboard"

export default function MonitoringPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ username: string } | null>(null)

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

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return <MonitoringDashboard />
}
