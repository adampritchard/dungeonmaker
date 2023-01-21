/*
  Warnings:

  - Made the column `authorId` on table `Dungeon` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Dungeon" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT DEFAULT 'untitled',
    "tiles" TEXT,
    "authorId" INTEGER NOT NULL,
    CONSTRAINT "Dungeon_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Dungeon" ("authorId", "id", "name", "tiles") SELECT "authorId", "id", "name", "tiles" FROM "Dungeon";
DROP TABLE "Dungeon";
ALTER TABLE "new_Dungeon" RENAME TO "Dungeon";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
