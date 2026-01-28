-- CreateTable
CREATE TABLE "tasks" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ngoId" INTEGER NOT NULL,
    "otp" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "tasks_ngoId_fkey" FOREIGN KEY ("ngoId") REFERENCES "ngos" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ratings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "taskId" INTEGER NOT NULL,
    "ngoId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "stars" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ratings_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ratings_ngoId_fkey" FOREIGN KEY ("ngoId") REFERENCES "ngos" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ngos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "contactNumber" TEXT,
    "description" TEXT,
    "accountOwnerId" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ngos_accountOwnerId_fkey" FOREIGN KEY ("accountOwnerId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ngos" ("accountOwnerId", "createdAt", "description", "id", "location", "name", "updatedAt") SELECT "accountOwnerId", "createdAt", "description", "id", "location", "name", "updatedAt" FROM "ngos";
DROP TABLE "ngos";
ALTER TABLE "new_ngos" RENAME TO "ngos";
CREATE INDEX "ngos_location_idx" ON "ngos"("location");
CREATE INDEX "ngos_accountOwnerId_idx" ON "ngos"("accountOwnerId");
CREATE UNIQUE INDEX "ngos_location_key" ON "ngos"("location");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "tasks_ngoId_idx" ON "tasks"("ngoId");

-- CreateIndex
CREATE INDEX "tasks_otp_idx" ON "tasks"("otp");

-- CreateIndex
CREATE INDEX "ratings_ngoId_idx" ON "ratings"("ngoId");

-- CreateIndex
CREATE INDEX "ratings_taskId_idx" ON "ratings"("taskId");

-- CreateIndex
CREATE UNIQUE INDEX "ratings_taskId_userId_key" ON "ratings"("taskId", "userId");
