/*
  Warnings:

  - The primary key for the `Dungeon` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Dungeon" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT DEFAULT 'untitled',
    "tiles" TEXT
);
INSERT INTO "new_Dungeon" ("id", "name", "tiles") SELECT "id", "name", "tiles" FROM "Dungeon";
DROP TABLE "Dungeon";
ALTER TABLE "new_Dungeon" RENAME TO "Dungeon";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
