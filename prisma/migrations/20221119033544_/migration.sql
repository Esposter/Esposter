/*
  Warnings:

  - You are about to drop the column `noPoints` on the `Post` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Post" DROP COLUMN "noPoints",
ADD COLUMN     "noLikes" INTEGER NOT NULL DEFAULT 0;
