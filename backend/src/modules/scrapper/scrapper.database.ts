import { PrismaClient } from "../../generated/prisma";

const prisma = new PrismaClient();

interface ScrapedData {
  productCatalog: string[];
  heroProducts: string[];
  privacyPolicy: {
    url: string;
    content?: string;
  };
  returnRefundPolicy: {
    url: string;
    content?: string;
  };
  brandFAQs: Array<{ question: string; answer: string }>;
  socialHandles: {
    instagram?: string;
    facebook?: string;
    tiktok?: string;
    twitter?: string;
    youtube?: string;
  };
  contactDetails: {
    emails: string[];
    phoneNumbers: string[];
    contactPageContent?: string;
  };
  brandContext: string;
  importantLinks: {
    orderTracking?: string;
    contactUs?: string;
    blogs?: string;
    shipping?: string;
    sizeGuide?: string;
    [key: string]: string | undefined;
  };
  blogPosts?: Array<{
    title: string;
    url: string;
    excerpt?: string;
  }>;
}

export class ScrapperDatabase {
  static async saveScrapedData(url: string, scrapedData: ScrapedData) {
    try {
      // Check if website already exists
      let website = await prisma.scrapedWebsite.findUnique({
        where: { url },
      });

      if (website) {
        // Delete existing related data to update with fresh scrape
        await this.deleteExistingData(website.id);
      } else {
        // Create new website record
        website = await prisma.scrapedWebsite.create({
          data: { url },
        });
      }

      // Save all scraped data
      await this.saveProducts(website.id, scrapedData.productCatalog);
      await this.saveHeroProducts(website.id, scrapedData.heroProducts);
      await this.savePrivacyPolicy(website.id, scrapedData.privacyPolicy);
      await this.saveReturnRefundPolicy(
        website.id,
        scrapedData.returnRefundPolicy
      );
      await this.saveFAQs(website.id, scrapedData.brandFAQs);
      await this.saveSocialHandles(website.id, scrapedData.socialHandles);
      await this.saveContactDetails(website.id, scrapedData.contactDetails);
      await this.saveBrandContext(website.id, scrapedData.brandContext);
      await this.saveImportantLinks(website.id, scrapedData.importantLinks);
      await this.saveBlogPosts(website.id, scrapedData.blogPosts);

      return website;
    } catch (error) {
      console.error("Error saving scraped data:", error);
      throw new Error("Failed to save scraped data to database");
    }
  }

  private static async deleteExistingData(websiteId: string) {
    await Promise.all([
      prisma.product.deleteMany({ where: { websiteId } }),
      prisma.heroProduct.deleteMany({ where: { websiteId } }),
      prisma.privacyPolicy.deleteMany({ where: { websiteId } }),
      prisma.returnRefundPolicy.deleteMany({ where: { websiteId } }),
      prisma.fAQ.deleteMany({ where: { websiteId } }),
      prisma.socialHandles.deleteMany({ where: { websiteId } }),
      prisma.contactDetails.deleteMany({ where: { websiteId } }),
      prisma.brandContext.deleteMany({ where: { websiteId } }),
      prisma.importantLinks.deleteMany({ where: { websiteId } }),
      prisma.blogPost.deleteMany({ where: { websiteId } }),
    ]);
  }

  private static async saveProducts(websiteId: string, products: string[]) {
    if (products.length > 0) {
      await prisma.product.createMany({
        data: products.map((name) => ({
          name,
          websiteId,
        })),
      });
    }
  }

  private static async saveHeroProducts(
    websiteId: string,
    heroProducts: string[]
  ) {
    if (heroProducts.length > 0) {
      await prisma.heroProduct.createMany({
        data: heroProducts.map((name) => ({
          name,
          websiteId,
        })),
      });
    }
  }

  private static async savePrivacyPolicy(
    websiteId: string,
    privacyPolicy: { url: string; content?: string }
  ) {
    if (privacyPolicy.url) {
      await prisma.privacyPolicy.create({
        data: {
          url: privacyPolicy.url,
          content: privacyPolicy.content,
          websiteId,
        },
      });
    }
  }

  private static async saveReturnRefundPolicy(
    websiteId: string,
    policy: { url: string; content?: string }
  ) {
    if (policy.url) {
      await prisma.returnRefundPolicy.create({
        data: {
          url: policy.url,
          content: policy.content,
          websiteId,
        },
      });
    }
  }

  private static async saveFAQs(
    websiteId: string,
    faqs: Array<{ question: string; answer: string }>
  ) {
    if (faqs.length > 0) {
      await prisma.fAQ.createMany({
        data: faqs.map((faq) => ({
          question: faq.question,
          answer: faq.answer,
          websiteId,
        })),
      });
    }
  }

  private static async saveSocialHandles(
    websiteId: string,
    socialHandles: {
      instagram?: string;
      facebook?: string;
      tiktok?: string;
      twitter?: string;
      youtube?: string;
    }
  ) {
    if (Object.values(socialHandles).some((handle) => handle)) {
      await prisma.socialHandles.create({
        data: {
          instagram: socialHandles.instagram,
          facebook: socialHandles.facebook,
          tiktok: socialHandles.tiktok,
          twitter: socialHandles.twitter,
          youtube: socialHandles.youtube,
          websiteId,
        },
      });
    }
  }

  private static async saveContactDetails(
    websiteId: string,
    contactDetails: {
      emails: string[];
      phoneNumbers: string[];
      contactPageContent?: string;
    }
  ) {
    await prisma.contactDetails.create({
      data: {
        emails: contactDetails.emails,
        phoneNumbers: contactDetails.phoneNumbers,
        contactPageContent: contactDetails.contactPageContent,
        websiteId,
      },
    });
  }

  private static async saveBrandContext(
    websiteId: string,
    brandContext: string
  ) {
    if (brandContext) {
      await prisma.brandContext.create({
        data: {
          content: brandContext,
          websiteId,
        },
      });
    }
  }

  private static async saveImportantLinks(
    websiteId: string,
    importantLinks: {
      orderTracking?: string;
      contactUs?: string;
      blogs?: string;
      shipping?: string;
      sizeGuide?: string;
      [key: string]: string | undefined;
    }
  ) {
    if (Object.values(importantLinks).some((link) => link)) {
      await prisma.importantLinks.create({
        data: {
          orderTracking: importantLinks.orderTracking,
          contactUs: importantLinks.contactUs,
          blogs: importantLinks.blogs,
          shipping: importantLinks.shipping,
          sizeGuide: importantLinks.sizeGuide,
          websiteId,
        },
      });
    }
  }

  private static async saveBlogPosts(
    websiteId: string,
    blogPosts?: Array<{
      title: string;
      url: string;
      excerpt?: string;
    }>
  ) {
    if (blogPosts && blogPosts.length > 0) {
      await prisma.blogPost.createMany({
        data: blogPosts.map((post) => ({
          title: post.title,
          url: post.url,
          excerpt: post.excerpt,
          websiteId,
        })),
      });
    }
  }

  static async getScrapedData(url: string) {
    return await prisma.scrapedWebsite.findUnique({
      where: { url },
      include: {
        products: true,
        heroProducts: true,
        privacyPolicy: true,
        returnRefundPolicy: true,
        faqs: true,
        socialHandles: true,
        contactDetails: true,
        brandContext: true,
        importantLinks: true,
        blogPosts: true,
      },
    });
  }

  static async getAllScrapedWebsites() {
    return await prisma.scrapedWebsite.findMany({
      include: {
        products: true,
        heroProducts: true,
        privacyPolicy: true,
        returnRefundPolicy: true,
        faqs: true,
        socialHandles: true,
        contactDetails: true,
        brandContext: true,
        importantLinks: true,
        blogPosts: true,
      },
    });
  }
}
