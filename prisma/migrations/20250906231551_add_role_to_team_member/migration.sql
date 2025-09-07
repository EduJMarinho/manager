/*
  Warnings:

  - Added the required column `role` to the `teams_members` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TeamRole" AS ENUM ('collaborator', 'partner');

-- AlterTable
ALTER TABLE "teams_members" ADD COLUMN     "role" "TeamRole" NOT NULL;
