-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TrainingDay" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "day" TEXT NOT NULL,
    "isRest" BOOLEAN NOT NULL DEFAULT false,
    "trainingPlanId" TEXT NOT NULL,
    CONSTRAINT "TrainingDay_trainingPlanId_fkey" FOREIGN KEY ("trainingPlanId") REFERENCES "TrainingPlan" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_TrainingDay" ("day", "id", "trainingPlanId") SELECT "day", "id", "trainingPlanId" FROM "TrainingDay";
DROP TABLE "TrainingDay";
ALTER TABLE "new_TrainingDay" RENAME TO "TrainingDay";
CREATE INDEX "TrainingDay_trainingPlanId_idx" ON "TrainingDay"("trainingPlanId");
CREATE UNIQUE INDEX "TrainingDay_trainingPlanId_day_key" ON "TrainingDay"("trainingPlanId", "day");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
