/*
  Warnings:

  - Added the required column `taskType` to the `AutomatedTask` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AutomatedTask" ADD COLUMN     "taskType" TEXT NOT NULL DEFAULT 'retailer_data',
ADD COLUMN     "uploadedFile" TEXT;

-- Update existing records to have a proper taskType
UPDATE "AutomatedTask" SET "taskType" = 'retailer_data' WHERE "taskType" = 'retailer_data';
