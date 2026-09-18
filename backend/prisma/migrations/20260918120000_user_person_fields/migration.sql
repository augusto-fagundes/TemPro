-- AlterTable
ALTER TABLE "users" ADD COLUMN "first_name" TEXT NOT NULL DEFAULT '';
ALTER TABLE "users" ADD COLUMN "last_name" TEXT NOT NULL DEFAULT '';
ALTER TABLE "users" ADD COLUMN "mobile" TEXT NOT NULL DEFAULT '';

-- Accounts created before this migration only ever gave a business name, so
-- there is nothing to split into first/last: they stay empty and the columns
-- keep their default. New accounts are required to fill all three.
