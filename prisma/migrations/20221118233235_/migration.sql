/*
  Warnings:

  - You are about to drop the column `edited` on the `Post` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Post" DROP COLUMN "edited",
ADD COLUMN     "updated" BOOLEAN NOT NULL DEFAULT false;
