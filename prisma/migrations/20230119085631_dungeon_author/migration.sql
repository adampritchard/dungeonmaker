-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Dungeon" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT DEFAULT 'untitled',
    "tiles" TEXT,
    "authorId" INTEGER,
    CONSTRAINT "Dungeon_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Dungeon" ("id", "name", "tiles") SELECT "id", "name", "tiles" FROM "Dungeon";
DROP TABLE "Dungeon";
ALTER TABLE "new_Dungeon" RENAME TO "Dungeon";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
