-- Update old status values to new ones
UPDATE "PipelineMonitoring"
SET "currentStatus" = 'UNRESOLVED'
WHERE "currentStatus" = 'FAILED_AGAIN';

UPDATE "PipelineMonitoring"
SET "currentStatus" = 'IN-PROGRESS'
WHERE "currentStatus" = 'PENDING';

-- Update old working team values to new format
UPDATE "PipelineMonitoring"
SET "workingTeam" = 'L1_TEAM'
WHERE "workingTeam" = 'L1_WORKING';

UPDATE "PipelineMonitoring"
SET "workingTeam" = 'L2_TEAM'
WHERE "workingTeam" = 'L2_WORKING';

UPDATE "PipelineMonitoring"
SET "workingTeam" = 'OPS_TEAM'
WHERE "workingTeam" = 'OPS_WORKING';
