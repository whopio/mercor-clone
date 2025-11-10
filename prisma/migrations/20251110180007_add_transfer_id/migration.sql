-- AlterTable
ALTER TABLE "Submission" ADD COLUMN "transferId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Submission_transferId_key" ON "Submission"("transferId");

