-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TrainingPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "durationWeeks" INTEGER NOT NULL DEFAULT 0,
    "startDate" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "TrainingPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_TrainingPlan" ("createdAt", "id", "isActive", "name", "updatedAt", "userId") SELECT "createdAt", "id", "isActive", "name", "updatedAt", "userId" FROM "TrainingPlan";
DROP TABLE "TrainingPlan";
ALTER TABLE "new_TrainingPlan" RENAME TO "TrainingPlan";
CREATE INDEX "TrainingPlan_userId_idx" ON "TrainingPlan"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
