import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { GoogleGenerativeAI } from "@google/generative-ai"

// Check if API_KEY is set
if (!process.env.API_KEY) {
  console.error("❌ ERROR: API_KEY environment variable is not set!")
  console.error("Please add API_KEY to your .env file")
  console.error("Get your free API key at: https://aistudio.google.com/app/apikey")
}

const genAI = new GoogleGenerativeAI(process.env.API_KEY || "")

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { message } = await request.json()

    if (!message || !message.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    // Fetch database context for the user
    const [tasks, automatedTasks, pipelines, pipelineMonitoring, pipelineMonitoringRecords] =
      await Promise.all([
        prisma.task.findMany({
          where: { userId: session.userId },
          select: {
            id: true,
            retailer: true,
            day: true,
            completed: true,
            completedAt: true,
            completedBy: true,
            loadType: true,
            fileCount: true,
            createdAt: true,
          },
        }),
        prisma.automatedTask.findMany({
          where: { userId: session.userId },
          select: {
            id: true,
            name: true,
            taskType: true,
            isActive: true,
            lastRun: true,
            createdAt: true,
          },
        }),
        prisma.pipeline.findMany({
          where: { userId: session.userId },
          select: {
            id: true,
            name: true,
            triggerName: true,
            isActive: true,
            createdAt: true,
          },
        }),
        prisma.pipelineMonitoring.findMany({
          where: { userId: session.userId },
          select: {
            id: true,
            triggerName: true,
            status: true,
            currentStatus: true,
            failureShift: true,
            date: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
          take: 50,
        }),
        prisma.pipelineMonitoringRecord.findMany({
          where: { userId: session.userId },
          select: {
            id: true,
            adfPipelineName: true,
            overallExecutionStatus: true,
            shiftIST: true,
            monitoringDate: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
          take: 50,
        }),
      ])

    // Prepare context for the AI
    const context = `
You are a helpful assistant for a Retailer Management System. You have access to the following data:

TASKS DATA:
- Total tasks: ${tasks.length}
- Completed tasks: ${tasks.filter((t) => t.completed).length}
- Pending tasks: ${tasks.filter((t) => !t.completed).length}
${tasks.length > 0 ? `- Task details:\n${tasks.map((t) => `  * ${t.retailer} (${t.day}) - ${t.completed ? "COMPLETED by " + t.completedBy : "PENDING"} - ${t.loadType}`).join("\n")}` : ""}

AUTOMATED TASKS DATA:
- Total automated tasks: ${automatedTasks.length}
- Active tasks: ${automatedTasks.filter((t) => t.isActive).length}
${automatedTasks.length > 0 ? `- Details:\n${automatedTasks.map((t) => `  * ${t.name} (${t.taskType}) - ${t.isActive ? "ACTIVE" : "INACTIVE"} - Last run: ${t.lastRun ? new Date(t.lastRun).toLocaleString() : "Never"}`).join("\n")}` : ""}

PIPELINES DATA:
- Total pipelines: ${pipelines.length}
- Active pipelines: ${pipelines.filter((p) => p.isActive).length}
${pipelines.length > 0 ? `- Pipeline names: ${pipelines.map((p) => p.name || p.triggerName).join(", ")}` : ""}

PIPELINE MONITORING DATA:
- Total monitoring records: ${pipelineMonitoring.length}
- Failed pipelines: ${pipelineMonitoring.filter((p) => p.status === "FAILED").length}
- Successful pipelines: ${pipelineMonitoring.filter((p) => p.status === "SUCCESS").length}
- Running pipelines: ${pipelineMonitoring.filter((p) => p.status === "RUNNING").length}
- Unresolved pipelines: ${pipelineMonitoring.filter((p) => p.currentStatus === "UNRESOLVED").length}
- In-progress pipelines: ${pipelineMonitoring.filter((p) => p.currentStatus === "IN-PROGRESS").length}
${pipelineMonitoring.length > 0 ? `\nRecent pipeline issues:\n${pipelineMonitoring.slice(0, 10).map((p) => `  * ${p.triggerName} - Status: ${p.status}, Current: ${p.currentStatus || "N/A"}`).join("\n")}` : ""}

PIPELINE MONITORING RECORDS:
- Total records: ${pipelineMonitoringRecords.length}
- Successful executions: ${pipelineMonitoringRecords.filter((r) => r.overallExecutionStatus === "SUCCESS").length}
- Failed executions: ${pipelineMonitoringRecords.filter((r) => r.overallExecutionStatus === "FAILED").length}
- Running executions: ${pipelineMonitoringRecords.filter((r) => r.overallExecutionStatus === "RUNNING").length}

Current date/time: ${new Date().toLocaleString()}

Please answer the user's question based on this data. Be concise and helpful. If the user asks about something not in the data, let them know you don't have that information.
`

    // Create chat session and send message
    const model = genAI.getGenerativeModel({ model: "gemini-pro" })

    const chat = model.startChat({
      history: [],
      generationConfig: {
        maxOutputTokens: 1024,
      },
    })

    const result = await chat.sendMessage(context + "\n\nUser question: " + message)
    const response = result.response
    const text = response.text()

    return NextResponse.json({
      response: text,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Chatbot error:", error)
    
    // Better error messages
    let errorMessage = "Failed to process chat message"
    
    if (error instanceof Error) {
      if (error.message.includes("API_KEY")) {
        errorMessage = "❌ API Key Error: Please check your .env file. API_KEY is missing or invalid. Get one at https://aistudio.google.com/app/apikey"
      } else if (error.message.includes("403") || error.message.includes("Forbidden")) {
        errorMessage = "❌ API Key Error: Your API key is invalid or not authorized. Try generating a new one at https://aistudio.google.com/app/apikey"
      } else if (error.message.includes("401") || error.message.includes("Unauthorized")) {
        errorMessage = "❌ Authentication Error: Please login again"
      } else {
        errorMessage = error.message
      }
    }
    
    return NextResponse.json(
      {
        error: errorMessage,
      },
      { status: 500 }
    )
  }
}

