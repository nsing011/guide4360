import { prisma } from "./lib/prisma"

async function updateData() {
  try {
    // Update FAILED_AGAIN to UNRESOLVED
    const failedAgainUpdate = await prisma.pipelineMonitoring.updateMany({
      where: {
        currentStatus: "FAILED_AGAIN"
      },
      data: {
        currentStatus: "UNRESOLVED"
      }
    })
    console.log(`Updated ${failedAgainUpdate.count} records from FAILED_AGAIN to UNRESOLVED`)

    // Update PENDING to IN-PROGRESS
    const pendingUpdate = await prisma.pipelineMonitoring.updateMany({
      where: {
        currentStatus: "PENDING"
      },
      data: {
        currentStatus: "IN-PROGRESS"
      }
    })
    console.log(`Updated ${pendingUpdate.count} records from PENDING to IN-PROGRESS`)

    // Update working teams
    const l1Update = await prisma.pipelineMonitoring.updateMany({
      where: {
        workingTeam: "L1_WORKING"
      },
      data: {
        workingTeam: "L1_TEAM"
      }
    })
    console.log(`Updated ${l1Update.count} L1_WORKING to L1_TEAM`)

    const l2Update = await prisma.pipelineMonitoring.updateMany({
      where: {
        workingTeam: "L2_WORKING"
      },
      data: {
        workingTeam: "L2_TEAM"
      }
    })
    console.log(`Updated ${l2Update.count} L2_WORKING to L2_TEAM`)

    const opsUpdate = await prisma.pipelineMonitoring.updateMany({
      where: {
        workingTeam: "OPS_WORKING"
      },
      data: {
        workingTeam: "OPS_TEAM"
      }
    })
    console.log(`Updated ${opsUpdate.count} OPS_WORKING to OPS_TEAM`)

    console.log("✅ All data updated successfully!")
  } catch (error) {
    console.error("❌ Error updating data:", error)
  } finally {
    await prisma.$disconnect()
  }
}

updateData()
