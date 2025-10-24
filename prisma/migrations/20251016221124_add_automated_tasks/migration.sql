-- CreateTable
CREATE TABLE "AutomatedTask" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastRun" TIMESTAMP(3),
    "nextRun" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "AutomatedTask_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AutomatedTask_userId_idx" ON "AutomatedTask"("userId");

-- AddForeignKey
ALTER TABLE "AutomatedTask" ADD CONSTRAINT "AutomatedTask_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
