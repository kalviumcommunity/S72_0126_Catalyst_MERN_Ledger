-- DropIndex
DROP INDEX "ngos_location_key";

-- CreateIndex
CREATE INDEX "ngos_isActive_idx" ON "ngos"("isActive");
