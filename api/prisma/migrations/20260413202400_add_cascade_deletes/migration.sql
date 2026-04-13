-- AlterTable: Make contributorId nullable on CapitalContribution
ALTER TABLE "CapitalContribution" ALTER COLUMN "contributorId" DROP NOT NULL;

-- AlterTable: Make userId nullable on Transaction
ALTER TABLE "Transaction" ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable: Make uploadedById nullable on Receipt
ALTER TABLE "Receipt" ALTER COLUMN "uploadedById" DROP NOT NULL;

-- AlterTable: Make userId nullable on Expense, drop hasReceipt/receiptUrl, add receiptId
ALTER TABLE "Expense" ALTER COLUMN "userId" DROP NOT NULL;
ALTER TABLE "Expense" DROP COLUMN IF EXISTS "hasReceipt";
ALTER TABLE "Expense" DROP COLUMN IF EXISTS "receiptUrl";
ALTER TABLE "Expense" ADD COLUMN "receiptId" TEXT;

-- CreateIndex for Expense.receiptId unique
CREATE UNIQUE INDEX "Expense_receiptId_key" ON "Expense"("receiptId");

-- DropForeignKey: User.companyId (change SET NULL to CASCADE)
ALTER TABLE "User" DROP CONSTRAINT "User_companyId_fkey";

-- DropForeignKey: Invitation constraints (change RESTRICT to CASCADE)
ALTER TABLE "Invitation" DROP CONSTRAINT "Invitation_companyId_fkey";
ALTER TABLE "Invitation" DROP CONSTRAINT "Invitation_invitedByUserId_fkey";

-- DropForeignKey: CapitalContribution constraints
ALTER TABLE "CapitalContribution" DROP CONSTRAINT "CapitalContribution_companyId_fkey";
ALTER TABLE "CapitalContribution" DROP CONSTRAINT "CapitalContribution_contributorId_fkey";

-- DropForeignKey: Transaction constraints
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_companyId_fkey";
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_userId_fkey";

-- DropForeignKey: Receipt constraints
ALTER TABLE "Receipt" DROP CONSTRAINT "Receipt_companyId_fkey";
ALTER TABLE "Receipt" DROP CONSTRAINT "Receipt_uploadedById_fkey";

-- DropForeignKey: Expense constraints
ALTER TABLE "Expense" DROP CONSTRAINT "Expense_companyId_fkey";
ALTER TABLE "Expense" DROP CONSTRAINT "Expense_userId_fkey";

-- AddForeignKey: User.companyId → Company (CASCADE)
ALTER TABLE "User" ADD CONSTRAINT "User_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: Invitation.companyId → Company (CASCADE)
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: Invitation.invitedByUserId → User (CASCADE)
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_invitedByUserId_fkey" FOREIGN KEY ("invitedByUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: CapitalContribution.companyId → Company (CASCADE)
ALTER TABLE "CapitalContribution" ADD CONSTRAINT "CapitalContribution_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: CapitalContribution.contributorId → User (SET NULL)
ALTER TABLE "CapitalContribution" ADD CONSTRAINT "CapitalContribution_contributorId_fkey" FOREIGN KEY ("contributorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey: Transaction.companyId → Company (CASCADE)
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: Transaction.userId → User (SET NULL)
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey: Receipt.companyId → Company (CASCADE)
ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: Receipt.uploadedById → User (SET NULL)
ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey: Expense.companyId → Company (CASCADE)
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: Expense.userId → User (SET NULL)
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey: Expense.receiptId → Receipt
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_receiptId_fkey" FOREIGN KEY ("receiptId") REFERENCES "Receipt"("id") ON DELETE SET NULL ON UPDATE CASCADE;
