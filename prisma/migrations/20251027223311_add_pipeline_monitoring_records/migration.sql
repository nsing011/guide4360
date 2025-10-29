-- CreateTable
CREATE TABLE "PipelineMonitoringRecord" (
    "id" TEXT NOT NULL,
    "monitoringDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "shiftIST" TEXT NOT NULL,
    "adfPipelineName" TEXT NOT NULL,
    "adfTriggerName" TEXT,
    "adfPipelineRunId" TEXT,
    "overallDurationHoursMins" TEXT,
    "overallExecutionStatus" TEXT,
    "monitoredBy" TEXT,
    "ifFailedAdfRerunId" TEXT,
    "snowIncidentNumber" TEXT,
    "failureHandled" TEXT,
    "postResolveDataLoadChecked" TEXT,
    "additionalComments" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "PipelineMonitoringRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PipelineMonitoringRecord_userId_idx" ON "PipelineMonitoringRecord"("userId");

-- CreateIndex
CREATE INDEX "PipelineMonitoringRecord_monitoringDate_idx" ON "PipelineMonitoringRecord"("monitoringDate");

-- CreateIndex
CREATE INDEX "PipelineMonitoringRecord_shiftIST_idx" ON "PipelineMonitoringRecord"("shiftIST");

-- CreateIndex
CREATE UNIQUE INDEX "PipelineMonitoringRecord_monitoringDate_shiftIST_adfPipelin_key" ON "PipelineMonitoringRecord"("monitoringDate", "shiftIST", "adfPipelineName", "userId");

-- AddForeignKey
ALTER TABLE "PipelineMonitoringRecord" ADD CONSTRAINT "PipelineMonitoringRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
