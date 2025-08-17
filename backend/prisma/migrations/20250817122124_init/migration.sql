-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."scraped_websites" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "scraped_websites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."products" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "websiteId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hero_products" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "websiteId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hero_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."privacy_policies" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "content" TEXT,
    "websiteId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "privacy_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."return_refund_policies" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "content" TEXT,
    "websiteId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "return_refund_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."faqs" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "websiteId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "faqs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."social_handles" (
    "id" TEXT NOT NULL,
    "instagram" TEXT,
    "facebook" TEXT,
    "tiktok" TEXT,
    "twitter" TEXT,
    "youtube" TEXT,
    "websiteId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "social_handles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."contact_details" (
    "id" TEXT NOT NULL,
    "emails" TEXT[],
    "phoneNumbers" TEXT[],
    "contactPageContent" TEXT,
    "websiteId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."brand_contexts" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "websiteId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "brand_contexts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."important_links" (
    "id" TEXT NOT NULL,
    "orderTracking" TEXT,
    "contactUs" TEXT,
    "blogs" TEXT,
    "shipping" TEXT,
    "sizeGuide" TEXT,
    "websiteId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "important_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."blog_posts" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "excerpt" TEXT,
    "websiteId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blog_posts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "scraped_websites_url_key" ON "public"."scraped_websites"("url");

-- CreateIndex
CREATE UNIQUE INDEX "privacy_policies_websiteId_key" ON "public"."privacy_policies"("websiteId");

-- CreateIndex
CREATE UNIQUE INDEX "return_refund_policies_websiteId_key" ON "public"."return_refund_policies"("websiteId");

-- CreateIndex
CREATE UNIQUE INDEX "social_handles_websiteId_key" ON "public"."social_handles"("websiteId");

-- CreateIndex
CREATE UNIQUE INDEX "contact_details_websiteId_key" ON "public"."contact_details"("websiteId");

-- CreateIndex
CREATE UNIQUE INDEX "brand_contexts_websiteId_key" ON "public"."brand_contexts"("websiteId");

-- CreateIndex
CREATE UNIQUE INDEX "important_links_websiteId_key" ON "public"."important_links"("websiteId");

-- AddForeignKey
ALTER TABLE "public"."scraped_websites" ADD CONSTRAINT "scraped_websites_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."products" ADD CONSTRAINT "products_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES "public"."scraped_websites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hero_products" ADD CONSTRAINT "hero_products_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES "public"."scraped_websites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."privacy_policies" ADD CONSTRAINT "privacy_policies_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES "public"."scraped_websites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."return_refund_policies" ADD CONSTRAINT "return_refund_policies_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES "public"."scraped_websites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."faqs" ADD CONSTRAINT "faqs_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES "public"."scraped_websites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."social_handles" ADD CONSTRAINT "social_handles_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES "public"."scraped_websites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."contact_details" ADD CONSTRAINT "contact_details_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES "public"."scraped_websites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."brand_contexts" ADD CONSTRAINT "brand_contexts_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES "public"."scraped_websites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."important_links" ADD CONSTRAINT "important_links_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES "public"."scraped_websites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."blog_posts" ADD CONSTRAINT "blog_posts_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES "public"."scraped_websites"("id") ON DELETE CASCADE ON UPDATE CASCADE;
