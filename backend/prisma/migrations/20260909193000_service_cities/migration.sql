-- AlterTable
ALTER TABLE "providers" ADD COLUMN "service_cities" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

UPDATE "providers"
SET "service_cities" = ARRAY["city"]
WHERE COALESCE(array_length("service_cities", 1), 0) = 0
  AND "city" IS NOT NULL
  AND btrim("city") <> '';
