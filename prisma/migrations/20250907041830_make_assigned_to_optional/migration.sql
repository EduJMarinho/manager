-- DropForeignKey
ALTER TABLE "tasks" DROP CONSTRAINT "tasks_assignedTo_fkey";

-- AlterTable
ALTER TABLE "tasks" ALTER COLUMN "assignedTo" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
