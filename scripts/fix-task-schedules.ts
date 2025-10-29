import { prisma } from "@/lib/prisma"

async function main() {
  try {
    // Update all tasks with null/empty schedule to "daily"
    const result = await prisma.task.updateMany({
      where: {
        OR: [
          { schedule: null },
          { schedule: "" }
        ]
      },
      data: {
        schedule: "daily"
      }
    })

    console.log(`✓ Updated ${result.count} tasks with default schedule "daily"`)
    
    // Show all tasks with their schedules
    const tasks = await prisma.task.findMany({
      select: {
        id: true,
        retailer: true,
        day: true,
        schedule: true
      }
    })
    
    console.log("\n📋 All tasks and their schedules:")
    tasks.forEach(task => {
      console.log(`   - ${task.retailer} (${task.day}): schedule="${task.schedule}"`)
    })

  } catch (error) {
    console.error("❌ Error:", error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
