"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { PipelinesDashboard } from "@/components/pipelines-dashboard"
import { PipelineMonitoringRecordsDashboard } from "@/components/pipeline-monitoring-records-dashboard"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function PipelinesPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ username: string } | null>(null)
  const [activeTab, setActiveTab] = useState("monitoring-records")

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

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="flex items-center gap-4 px-4 sm:px-6 py-4">
          <Button variant="ghost" size="sm" onClick={() => router.push("/")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Important Pipelines</h1>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="border-b border-border px-4 sm:px-6">
          <TabsList className="h-auto bg-transparent p-0 rounded-none">
            <TabsTrigger value="monitoring-records" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
              Monitoring Records
            </TabsTrigger>
            <TabsTrigger value="master-pipelines" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
              Pipeline List
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="monitoring-records">
          <PipelineMonitoringRecordsDashboard />
        </TabsContent>

        <TabsContent value="master-pipelines">
          <PipelinesDashboard />
        </TabsContent>
      </Tabs>
    </div>
  )
}
