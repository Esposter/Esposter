/*
  Warnings:

  - You are about to drop the column `lastSentMessageCreatedAt` on the `Room` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Room" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "avatar" TEXT,
    "cursor" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME
);
INSERT INTO "new_Room" ("avatar", "createdAt", "deletedAt", "id", "name", "updatedAt") SELECT "avatar", "createdAt", "deletedAt", "id", "name", "updatedAt" FROM "Room";
DROP TABLE "Room";
ALTER TABLE "new_Room" RENAME TO "Room";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
