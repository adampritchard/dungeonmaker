-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Dungeon" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT DEFAULT 'untitled'
);
INSERT INTO "new_Dungeon" ("id", "name") SELECT "id", "name" FROM "Dungeon";
DROP TABLE "Dungeon";
ALTER TABLE "new_Dungeon" RENAME TO "Dungeon";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
