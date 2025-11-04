import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    const allTasks = await prisma.task.findMany({
      select: {
        id: true,
        retailer: true,
        day: true,
        schedule: true,
        scheduleDays: true
      }
    })

    console.log("\n📋 All Task Details:")
    const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    const SCHEDULE_MAP: any = {
      daily: [0, 1, 2, 3, 4, 5, 6],
      "mon-fri": [1, 2, 3, 4, 5],
      "mon-sun": [1, 2, 3, 4, 5, 6, 0],
      weekly: [1],
      biweekly: [1],
    }

    allTasks.forEach(t => {
      const schedule = t.schedule || "daily"
      const applicableDays = SCHEDULE_MAP[schedule] || SCHEDULE_MAP["daily"]
      const applicableDayNames = applicableDays.map((d: number) => DAYS_OF_WEEK[d]).join(", ")
      
      console.log(`\n  Task: "${t.retailer}"`)
      console.log(`    day field: "${t.day}"`)
      console.log(`    schedule: "${schedule}"`)
      console.log(`    scheduleDays: "${t.scheduleDays || 'N/A'}"`)
      console.log(`    runs on: [${applicableDays.join(",")}] = ${applicableDayNames}`)
      console.log(`    ✓ Shows on Wednesday? ${applicableDays.includes(3) ? 'YES' : 'NO'}`)
    })

    console.log("\n📅 Testing: Wednesday = day 3")
    console.log("Tasks that should show on Wednesday:")
    allTasks.forEach(t => {
      const schedule = t.schedule || "daily"
      const applicableDays = SCHEDULE_MAP[schedule] || SCHEDULE_MAP["daily"]
      if (applicableDays.includes(3)) {
        console.log(`  ✓ ${t.retailer}`)
      }
    })

  } catch (error) {
    console.error("Error:", error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
