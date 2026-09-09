-- CreateTable
CREATE TABLE "categories" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "plural" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

-- CreateIndex
CREATE INDEX "categories_sort_order_idx" ON "categories"("sort_order");

-- Backfill from existing service names, then known extras
INSERT INTO "categories" ("name", "plural", "sort_order", "updated_at")
SELECT DISTINCT s."category", s."category", 0, CURRENT_TIMESTAMP
FROM "services" s
WHERE s."category" IS NOT NULL AND btrim(s."category") <> ''
ON CONFLICT ("name") DO NOTHING;

INSERT INTO "categories" ("name", "plural", "sort_order", "updated_at")
VALUES
    ('Ar-condicionado', 'Ar-condicionado', 0, CURRENT_TIMESTAMP),
    ('Chaveiro', 'Chaveiros', 1, CURRENT_TIMESTAMP),
    ('Diarista', 'Diaristas', 2, CURRENT_TIMESTAMP),
    ('Eletricista', 'Eletricistas', 3, CURRENT_TIMESTAMP),
    ('Encanador', 'Encanadores', 4, CURRENT_TIMESTAMP),
    ('Fotógrafo', 'Fotógrafos', 5, CURRENT_TIMESTAMP),
    ('Informática', 'Informática', 6, CURRENT_TIMESTAMP),
    ('Jardinagem', 'Jardinagem', 7, CURRENT_TIMESTAMP),
    ('Limpeza', 'Limpeza', 8, CURRENT_TIMESTAMP),
    ('Marceneiro', 'Marceneiros', 9, CURRENT_TIMESTAMP),
    ('Mecânico', 'Mecânicos', 10, CURRENT_TIMESTAMP),
    ('Pedreiro', 'Pedreiros', 11, CURRENT_TIMESTAMP),
    ('Pintor', 'Pintores', 12, CURRENT_TIMESTAMP),
    ('Serralheiro', 'Serralheiros', 13, CURRENT_TIMESTAMP),
    ('Técnico de informática', 'Técnicos de informática', 14, CURRENT_TIMESTAMP),
    ('Vidraceiro', 'Vidraceiros', 15, CURRENT_TIMESTAMP)
ON CONFLICT ("name") DO UPDATE SET
    "plural" = EXCLUDED."plural",
    "sort_order" = EXCLUDED."sort_order";

-- AlterTable
ALTER TABLE "services" ADD COLUMN "category_id" INTEGER;

UPDATE "services" AS s
SET "category_id" = c."id"
FROM "categories" AS c
WHERE c."name" = s."category";

INSERT INTO "categories" ("name", "plural", "sort_order", "updated_at")
SELECT DISTINCT s."category", s."category", 99, CURRENT_TIMESTAMP
FROM "services" s
WHERE s."category_id" IS NULL AND s."category" IS NOT NULL
ON CONFLICT ("name") DO NOTHING;

UPDATE "services" AS s
SET "category_id" = c."id"
FROM "categories" AS c
WHERE s."category_id" IS NULL AND c."name" = s."category";

ALTER TABLE "services" ALTER COLUMN "category_id" SET NOT NULL;

ALTER TABLE "services" DROP COLUMN "category";

-- CreateIndex
CREATE INDEX "services_category_id_idx" ON "services"("category_id");

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
