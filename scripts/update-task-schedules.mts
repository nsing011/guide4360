import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log("🔄 Checking tasks for missing schedules...")
    
    // First, check current state
    const allTasks = await prisma.task.findMany({
      select: {
        id: true,
        retailer: true,
        schedule: true
      }
    })
    
    console.log("\n📋 Current tasks:")
    allTasks.forEach(t => {
      console.log(`   ${t.retailer}: schedule = "${t.schedule || 'NULL/UNDEFINED'}"`)
    })

    // Update tasks with NULL or empty schedule
    const result = await prisma.task.updateMany({
      where: {
        OR: [
          { schedule: null as any },
          { schedule: "" }
        ]
      },
      data: {
        schedule: "daily"
      }
    })

    console.log(`\n✅ Updated ${result.count} tasks to schedule "daily"`)

    // Show updated state
    const updatedTasks = await prisma.task.findMany({
      select: {
        id: true,
        retailer: true,
        schedule: true
      }
    })

    console.log("\n📋 Updated tasks:")
    updatedTasks.forEach(t => {
      console.log(`   ${t.retailer}: schedule = "${t.schedule}"`)
    })

  } catch (error) {
    console.error("❌ Error:", error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
