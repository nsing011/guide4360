-- AlterTable
ALTER TABLE "AutomatedTask" ALTER COLUMN "taskType" DROP DEFAULT;

-- CreateTable
CREATE TABLE "Pipeline" (
    "id" TEXT NOT NULL,
    "triggerName" TEXT NOT NULL,
    "description" TEXT,
    "shift" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Pipeline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PipelineMonitoring" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "shift" TEXT NOT NULL,
    "triggerName" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "monitoredBy" TEXT NOT NULL,
    "reRunId" TEXT,
    "incNumber" TEXT,
    "currentStatus" TEXT,
    "resolvedBy" TEXT,
    "workingTeam" TEXT,
    "comments" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "PipelineMonitoring_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Pipeline_userId_idx" ON "Pipeline"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Pipeline_triggerName_shift_key" ON "Pipeline"("triggerName", "shift");

-- CreateIndex
CREATE INDEX "PipelineMonitoring_userId_idx" ON "PipelineMonitoring"("userId");

-- CreateIndex
CREATE INDEX "PipelineMonitoring_date_idx" ON "PipelineMonitoring"("date");

-- CreateIndex
CREATE INDEX "PipelineMonitoring_shift_idx" ON "PipelineMonitoring"("shift");

-- AddForeignKey
ALTER TABLE "Pipeline" ADD CONSTRAINT "Pipeline_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PipelineMonitoring" ADD CONSTRAINT "PipelineMonitoring_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
