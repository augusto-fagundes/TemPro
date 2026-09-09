-- CreateTable
CREATE TABLE "providers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "listing_price" TEXT NOT NULL DEFAULT '',
    "about" TEXT NOT NULL DEFAULT '',
    "address" TEXT,
    "photo_url" TEXT,
    "whatsapp" TEXT,
    "phone" TEXT,
    "instagram" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "providers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provider_photos" (
    "id" SERIAL NOT NULL,
    "provider_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "provider_photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "services" (
    "id" SERIAL NOT NULL,
    "provider_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "mode" TEXT NOT NULL,
    "price_type" TEXT NOT NULL,
    "price_amount" TEXT NOT NULL DEFAULT '',
    "display_price" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "providers_city_idx" ON "providers"("city");

-- CreateIndex
CREATE INDEX "providers_category_idx" ON "providers"("category");

-- CreateIndex
CREATE INDEX "providers_sort_order_idx" ON "providers"("sort_order");

-- CreateIndex
CREATE INDEX "provider_photos_provider_id_idx" ON "provider_photos"("provider_id");

-- CreateIndex
CREATE INDEX "services_provider_id_idx" ON "services"("provider_id");

-- AddForeignKey
ALTER TABLE "provider_photos" ADD CONSTRAINT "provider_photos_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
