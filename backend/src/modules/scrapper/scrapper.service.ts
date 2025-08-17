import axios from "axios";
import * as cheerio from "cheerio";

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
    [key: string]: string | undefined;
  };
  blogPosts?: Array<{
    title: string;
    url: string;
    excerpt?: string;
  }>;
}

export class ScrapperService {
  static async scrape(url: string): Promise<ScrapedData> {
    try {
      // Validate and format the URL
      let formattedUrl = url.trim();

      // Add protocol if missing
      if (
        !formattedUrl.startsWith("http://") &&
        !formattedUrl.startsWith("https://")
      ) {
        formattedUrl = "https://" + formattedUrl;
      }

      // Validate URL format
      try {
        new URL(formattedUrl);
      } catch (urlError) {
        throw new Error(`Invalid URL format: ${url}`);
      }

      const response = await axios.get(formattedUrl, {
        timeout: 15000, // Increased timeout
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
      });

      const html = response.data;
      const $ = cheerio.load(html);

      // Extract structured data with enhanced methods
      const scrapedData: ScrapedData = {
        productCatalog: await this.extractProductCatalog($, formattedUrl),
        heroProducts: this.extractHeroProducts($),
        privacyPolicy: await this.extractPrivacyPolicy($, formattedUrl),
        returnRefundPolicy: await this.extractReturnRefundPolicy(
          $,
          formattedUrl
        ),
        brandFAQs: await this.extractBrandFAQs($, formattedUrl),
        socialHandles: this.extractSocialHandles($),
        contactDetails: await this.extractContactDetails($, formattedUrl),
        brandContext: await this.extractBrandContext($, formattedUrl),
        importantLinks: this.extractImportantLinks($, formattedUrl),
        blogPosts: await this.extractBlogPosts($, formattedUrl),
      };

      return scrapedData;
    } catch (error) {
      console.error("Error scraping the URL:", error);

      if (error instanceof Error) {
        throw new Error(`Failed to scrape the URL: ${error.message}`);
      }

      throw new Error("Failed to scrape the URL");
    }
  }

  private static async extractProductCatalog(
    $: cheerio.CheerioAPI,
    baseUrl: string
  ): Promise<string[]> {
    const products: string[] = [];

    // Look for common product selectors on main page
    const productSelectors = [
      ".product-item",
      ".product-card",
      ".product",
      "[data-product]",
      ".item-product",
      ".product-list-item",
      ".product-tile",
      ".product-grid-item",
    ];

    productSelectors.forEach((selector) => {
      $(selector).each((_, element) => {
        const productName = $(element)
          .find(".product-title, .product-name, h3, h4, .title")
          .first()
          .text()
          .trim();
        if (productName && !products.includes(productName)) {
          products.push(productName);
        }
      });
    });

    // Look for product links
    $(
      'a[href*="product"], a[href*="item"], a[href*="shop"], a[href*="/p/"]'
    ).each((_, element) => {
      const text = $(element).text().trim();
      if (
        text &&
        text.length > 3 &&
        text.length < 100 &&
        !products.includes(text) &&
        !text.toLowerCase().includes("view") &&
        !text.toLowerCase().includes("more")
      ) {
        products.push(text);
      }
    });

    // Try to find and visit product listing pages
    const productPageLinks = [
      'a[href*="products"]',
      'a[href*="shop"]',
      'a[href*="catalog"]',
      'a[href*="store"]',
      'a:contains("Products")',
      'a:contains("Shop")',
      'a:contains("All Products")',
    ];

    for (const selector of productPageLinks) {
      const element = $(selector).first();
      if (element.length) {
        const href = element.attr("href");
        if (href) {
          const fullUrl = this.resolveUrl(href, baseUrl);
          try {
            console.log(`Trying to fetch product catalog from: ${fullUrl}`);
            const productPageContent = await this.fetchPageContent(fullUrl);
            const productPage$ = cheerio.load(productPageContent);

            // Extract products from the product listing page
            productSelectors.forEach((selector) => {
              productPage$(selector).each((_, element) => {
                const productName = productPage$(element)
                  .find(".product-title, .product-name, h3, h4, .title")
                  .first()
                  .text()
                  .trim();
                if (productName && !products.includes(productName)) {
                  products.push(productName);
                }
              });
            });

            // Also check for product links on the products page
            productPage$('a[href*="product"], a[href*="item"]').each(
              (_, element) => {
                const text = productPage$(element).text().trim();
                if (
                  text &&
                  text.length > 3 &&
                  text.length < 100 &&
                  !products.includes(text) &&
                  !text.toLowerCase().includes("view") &&
                  !text.toLowerCase().includes("more")
                ) {
                  products.push(text);
                }
              }
            );

            break; // Stop after successfully fetching one product page
          } catch (error) {
            console.log(`Failed to fetch product catalog from ${fullUrl}`);
          }
        }
      }
    }

    return products.slice(0, 10); // Increased limit to 100 products
  }

  private static extractHeroProducts($: cheerio.CheerioAPI): string[] {
    const heroProducts: string[] = [];

    // Look for hero/featured product sections
    const heroSelectors = [
      ".hero-product",
      ".featured-product",
      ".banner-product",
      ".home-product",
      ".spotlight-product",
    ];

    heroSelectors.forEach((selector) => {
      $(selector).each((_, element) => {
        const productName = $(element)
          .find(".product-title, .product-name, h1, h2, h3")
          .first()
          .text()
          .trim();
        if (productName && !heroProducts.includes(productName)) {
          heroProducts.push(productName);
        }
      });
    });

    return heroProducts;
  }

  private static async extractPrivacyPolicy(
    $: cheerio.CheerioAPI,
    baseUrl: string
  ): Promise<{ url: string; content?: string }> {
    const privacySelectors = [
      'a[href*="privacy"]',
      'a[href*="Privacy"]',
      'a[href*="PRIVACY"]',
      "[data-privacy]",
      ".privacy-policy",
      'a:contains("Privacy Policy")',
      'a:contains("Privacy")',
      'a[href*="terms"]', // Sometimes privacy is combined with terms
    ];

    for (const selector of privacySelectors) {
      const element = $(selector).first();
      if (element.length) {
        const href = element.attr("href");
        if (href) {
          const fullUrl = this.resolveUrl(href, baseUrl);
          try {
            console.log(`Fetching privacy policy from: ${fullUrl}`);
            const pageResponse = await axios.get(fullUrl, {
              timeout: 10000,
              headers: {
                "User-Agent":
                  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
              },
            });

            const page$ = cheerio.load(pageResponse.data);

            // Extract meaningful content from privacy policy page
            let content = "";

            // Look for main content areas
            const contentSelectors = [
              ".privacy-policy",
              ".policy-content",
              ".main-content",
              ".content",
              "main",
              ".page-content",
              ".entry-content",
            ];

            for (const contentSelector of contentSelectors) {
              const contentElement = page$(contentSelector);
              if (
                contentElement.length &&
                contentElement.text().trim().length > 100
              ) {
                content = contentElement.text().trim();
                break;
              }
            }

            // If no specific content area found, get body content but filter out navigation
            if (!content) {
              page$("nav, header, footer, .navigation, .menu").remove();
              content = page$("body").text().trim();
            }

            return { url: fullUrl, content: content.substring(0, 5000) }; // Limit content length
          } catch (error) {
            console.log(
              `Failed to fetch privacy policy content from ${fullUrl}:`,
              error
            );
            return { url: fullUrl };
          }
        }
        return { url: element.text().trim() };
      }
    }

    return { url: "" };
  }

  private static async extractReturnRefundPolicy(
    $: cheerio.CheerioAPI,
    baseUrl: string
  ): Promise<{ url: string; content?: string }> {
    const policySelectors = [
      'a[href*="return"]',
      'a[href*="refund"]',
      'a[href*="exchange"]',
      'a[href*="shipping"]',
      "[data-return]",
      ".return-policy",
      ".refund-policy",
      'a:contains("Return Policy")',
      'a:contains("Refund Policy")',
      'a:contains("Returns")',
      'a:contains("Shipping & Returns")',
    ];

    for (const selector of policySelectors) {
      const element = $(selector).first();
      if (element.length) {
        const href = element.attr("href");
        if (href) {
          const fullUrl = this.resolveUrl(href, baseUrl);
          try {
            console.log(`Fetching return/refund policy from: ${fullUrl}`);
            const pageResponse = await axios.get(fullUrl, {
              timeout: 10000,
              headers: {
                "User-Agent":
                  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
              },
            });

            const page$ = cheerio.load(pageResponse.data);

            // Extract meaningful content
            let content = "";

            const contentSelectors = [
              ".return-policy",
              ".refund-policy",
              ".shipping-policy",
              ".policy-content",
              ".main-content",
              ".content",
              "main",
              ".page-content",
              ".entry-content",
            ];

            for (const contentSelector of contentSelectors) {
              const contentElement = page$(contentSelector);
              if (
                contentElement.length &&
                contentElement.text().trim().length > 100
              ) {
                content = contentElement.text().trim();
                break;
              }
            }

            if (!content) {
              page$("nav, header, footer, .navigation, .menu").remove();
              content = page$("body").text().trim();
            }

            return { url: fullUrl, content: content.substring(0, 5000) };
          } catch (error) {
            console.log(
              `Failed to fetch return/refund policy content from ${fullUrl}:`,
              error
            );
            return { url: fullUrl };
          }
        }
        return { url: element.text().trim() };
      }
    }

    return { url: "" };
  }

  private static async extractBrandFAQs(
    $: cheerio.CheerioAPI,
    baseUrl: string
  ): Promise<Array<{ question: string; answer: string }>> {
    const faqs: Array<{ question: string; answer: string }> = [];

    // First, try to extract FAQs from the current page
    const faqSelectors = [
      ".faq-item",
      ".faq-question",
      ".accordion-item",
      "[data-faq]",
      ".faq-section .question",
      ".help-item",
    ];

    faqSelectors.forEach((selector) => {
      $(selector).each((_, element) => {
        const question = $(element)
          .find(".question, .faq-question, h3, h4, dt, .accordion-header")
          .first()
          .text()
          .trim();
        const answer = $(element)
          .find(".answer, .faq-answer, p, dd, .accordion-content")
          .first()
          .text()
          .trim();

        if (question && answer && question.length > 5 && answer.length > 5) {
          faqs.push({ question, answer });
        }
      });
    });

    // Look for FAQ pages
    const faqPageSelectors = [
      'a[href*="faq"]',
      'a[href*="FAQ"]',
      'a[href*="help"]',
      'a[href*="support"]',
      'a:contains("FAQ")',
      'a:contains("Frequently Asked")',
      'a:contains("Help")',
      'a:contains("Support")',
    ];

    for (const selector of faqPageSelectors) {
      const element = $(selector).first();
      if (element.length) {
        const href = element.attr("href");
        if (href) {
          const fullUrl = this.resolveUrl(href, baseUrl);
          try {
            console.log(`Fetching FAQs from: ${fullUrl}`);
            const pageResponse = await axios.get(fullUrl, {
              timeout: 10000,
              headers: {
                "User-Agent":
                  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
              },
            });

            const page$ = cheerio.load(pageResponse.data);

            // Extract FAQs from the FAQ page
            faqSelectors.forEach((faqSelector) => {
              page$(faqSelector).each((_, element) => {
                const question = page$(element)
                  .find(
                    ".question, .faq-question, h3, h4, dt, .accordion-header"
                  )
                  .first()
                  .text()
                  .trim();
                const answer = page$(element)
                  .find(".answer, .faq-answer, p, dd, .accordion-content")
                  .first()
                  .text()
                  .trim();

                if (
                  question &&
                  answer &&
                  question.length > 5 &&
                  answer.length > 5
                ) {
                  // Check if we already have this FAQ
                  const exists = faqs.some(
                    (faq) =>
                      faq.question.toLowerCase() === question.toLowerCase()
                  );
                  if (!exists) {
                    faqs.push({ question, answer });
                  }
                }
              });
            });

            // Also try to extract from Q&A pattern text
            const bodyText = page$("body").text();
            const patterns = [
              /Q[:\)]?\s*(.+?)\s*A[:\)]?\s*(.+?)(?=Q[:\)]|$)/gi,
              /Question[:\)]?\s*(.+?)\s*Answer[:\)]?\s*(.+?)(?=Question|$)/gi,
              /\?\s*(.+?)\s*Answer[:\)]?\s*(.+?)(?=\?|$)/gi,
            ];

            patterns.forEach((pattern) => {
              let match;
              while (
                (match = pattern.exec(bodyText)) !== null &&
                faqs.length < 30
              ) {
                if (
                  match[1] &&
                  match[2] &&
                  match[1].trim().length > 5 &&
                  match[2].trim().length > 5
                ) {
                  const question = match[1].trim();
                  const answer = match[2].trim();
                  const exists = faqs.some(
                    (faq) =>
                      faq.question.toLowerCase() === question.toLowerCase()
                  );
                  if (!exists) {
                    faqs.push({ question, answer });
                  }
                }
              }
            });

            break; // Stop after successfully fetching one FAQ page
          } catch (error) {
            console.log(`Failed to fetch FAQs from ${fullUrl}:`, error);
          }
        }
      }
    }

    // Also look for text patterns that might be FAQs on current page
    const bodyText = $("body").text();
    const faqPattern = /Q\)\s*(.+?)\s*A\)\s*(.+?)(?=Q\)|$)/gi;
    let match;

    while ((match = faqPattern.exec(bodyText)) !== null && faqs.length < 30) {
      if (match[1] && match[2]) {
        const question = match[1].trim();
        const answer = match[2].trim();
        const exists = faqs.some(
          (faq) => faq.question.toLowerCase() === question.toLowerCase()
        );
        if (!exists) {
          faqs.push({ question, answer });
        }
      }
    }

    return faqs.slice(0, 30); // Increased limit to 30 FAQs
  }

  private static extractSocialHandles(
    $: cheerio.CheerioAPI
  ): ScrapedData["socialHandles"] {
    const socialHandles: ScrapedData["socialHandles"] = {};

    // Look for social media links
    $('a[href*="instagram.com"], a[href*="instagr.am"]').each((_, element) => {
      socialHandles.instagram = $(element).attr("href");
    });

    $('a[href*="facebook.com"], a[href*="fb.com"]').each((_, element) => {
      socialHandles.facebook = $(element).attr("href");
    });

    $('a[href*="tiktok.com"]').each((_, element) => {
      socialHandles.tiktok = $(element).attr("href");
    });

    $('a[href*="twitter.com"], a[href*="x.com"]').each((_, element) => {
      socialHandles.twitter = $(element).attr("href");
    });

    $('a[href*="youtube.com"]').each((_, element) => {
      socialHandles.youtube = $(element).attr("href");
    });

    return socialHandles;
  }

  private static async extractContactDetails(
    $: cheerio.CheerioAPI,
    baseUrl: string
  ): Promise<ScrapedData["contactDetails"]> {
    const emails: string[] = [];
    const phoneNumbers: string[] = [];

    // Extract emails and phones from current page
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const bodyText = $("body").text();
    const emailMatches = bodyText.match(emailRegex);
    if (emailMatches) {
      emails.push(
        ...emailMatches.filter(
          (email) =>
            !email.includes("example.com") &&
            !email.includes("placeholder") &&
            !email.includes("test.com")
        )
      );
    }

    // Look for email links
    $('a[href^="mailto:"]').each((_, element) => {
      const email = $(element).attr("href")?.replace("mailto:", "");
      if (email && !emails.includes(email)) {
        emails.push(email);
      }
    });

    // Extract phone numbers with better regex
    const phoneRegex =
      /(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}|\+[0-9]{1,3}[-.\s]?[0-9]{3,14}|1-800-[0-9-]+/g;
    const phoneMatches = bodyText.match(phoneRegex);
    if (phoneMatches) {
      phoneNumbers.push(...phoneMatches.filter((phone) => phone.length >= 10));
    }

    // Look for tel links
    $('a[href^="tel:"]').each((_, element) => {
      const phone = $(element).attr("href")?.replace("tel:", "");
      if (phone && !phoneNumbers.includes(phone)) {
        phoneNumbers.push(phone);
      }
    });

    // Try to visit contact page for more details
    let contactPageContent: string | undefined;
    const contactSelectors = [
      'a[href*="contact"]',
      'a[href*="Contact"]',
      'a:contains("Contact")',
      'a:contains("Contact Us")',
      'a:contains("Get in Touch")',
      'a[href*="support"]',
    ];

    for (const selector of contactSelectors) {
      const contactLink = $(selector).first();
      if (contactLink.length) {
        const href = contactLink.attr("href");
        if (href) {
          const fullUrl = this.resolveUrl(href, baseUrl);
          try {
            console.log(`Fetching contact details from: ${fullUrl}`);
            const pageResponse = await axios.get(fullUrl, {
              timeout: 10000,
              headers: {
                "User-Agent":
                  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
              },
            });

            const page$ = cheerio.load(pageResponse.data);
            const pageText = page$("body").text();

            // Extract additional emails from contact page
            const pageEmailMatches = pageText.match(emailRegex);
            if (pageEmailMatches) {
              pageEmailMatches.forEach((email) => {
                if (
                  !emails.includes(email) &&
                  !email.includes("example.com") &&
                  !email.includes("placeholder")
                ) {
                  emails.push(email);
                }
              });
            }

            // Extract additional phone numbers
            const pagePhoneMatches = pageText.match(phoneRegex);
            if (pagePhoneMatches) {
              pagePhoneMatches.forEach((phone) => {
                if (!phoneNumbers.includes(phone) && phone.length >= 10) {
                  phoneNumbers.push(phone);
                }
              });
            }

            // Get clean contact page content
            page$("nav, header, footer, .navigation, .menu").remove();
            contactPageContent = page$("body").text().trim().substring(0, 2000);

            break; // Stop after successfully fetching one contact page
          } catch (error) {
            console.log(
              `Failed to fetch contact page content from ${fullUrl}:`,
              error
            );
          }
        }
      }
    }

    return {
      emails: [...new Set(emails)], // Remove duplicates
      phoneNumbers: [...new Set(phoneNumbers)].slice(0, 3), // Limit to 3 phone numbers
      contactPageContent,
    };
  }

  private static async extractBrandContext(
    $: cheerio.CheerioAPI,
    baseUrl: string
  ): Promise<string> {
    // First try to find brand context on current page
    const aboutSelectors = [
      ".about-us",
      ".about-brand",
      ".company-info",
      ".brand-story",
      "[data-about]",
      ".about-section",
      ".our-story",
    ];

    for (const selector of aboutSelectors) {
      const element = $(selector).first();
      if (element.length && element.text().trim().length > 50) {
        return element.text().trim().substring(0, 1000);
      }
    }

    // Look for "About" links and try to visit the about page
    const aboutPageSelectors = [
      'a[href*="about"]',
      'a[href*="About"]',
      'a:contains("About")',
      'a:contains("About Us")',
      'a:contains("Our Story")',
      'a:contains("Who We Are")',
      'a[href*="story"]',
    ];

    for (const selector of aboutPageSelectors) {
      const aboutLink = $(selector).first();
      if (aboutLink.length) {
        const href = aboutLink.attr("href");
        if (href) {
          const fullUrl = this.resolveUrl(href, baseUrl);
          try {
            console.log(`Fetching brand context from: ${fullUrl}`);
            const pageResponse = await axios.get(fullUrl, {
              timeout: 10000,
              headers: {
                "User-Agent":
                  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
              },
            });

            const page$ = cheerio.load(pageResponse.data);

            // Try to find main content
            const contentSelectors = [
              ".about-content",
              ".story-content",
              ".main-content",
              ".content",
              "main",
              ".page-content",
              ".entry-content",
            ];

            for (const contentSelector of contentSelectors) {
              const contentElement = page$(contentSelector);
              if (
                contentElement.length &&
                contentElement.text().trim().length > 100
              ) {
                return contentElement.text().trim().substring(0, 1000);
              }
            }

            // If no specific content found, get body but remove navigation
            page$("nav, header, footer, .navigation, .menu").remove();
            const content = page$("body").text().trim();
            if (content.length > 100) {
              return content.substring(0, 1000);
            }

            break; // Stop after trying one about page
          } catch (error) {
            console.log(
              `Failed to fetch brand context from ${fullUrl}:`,
              error
            );
          }
        }
      }
    }

    // Look for "About" links and try to extract nearby content from current page
    const aboutLink = $('a[href*="about"], a:contains("About")').first();
    if (aboutLink.length) {
      const nearbyText = aboutLink.closest("section, div").text().trim();
      if (nearbyText.length > 50) {
        return nearbyText.substring(0, 1000);
      }
    }

    return "";
  }

  private static extractImportantLinks(
    $: cheerio.CheerioAPI,
    baseUrl: string
  ): ScrapedData["importantLinks"] {
    const importantLinks: ScrapedData["importantLinks"] = {};

    // Order tracking
    $(
      'a[href*="track"], a[href*="order"], a:contains("Track Order"), a:contains("Order Status")'
    ).each((_, element) => {
      if (!importantLinks.orderTracking) {
        const href = $(element).attr("href");
        importantLinks.orderTracking = href
          ? this.resolveUrl(href, baseUrl)
          : $(element).text().trim();
      }
    });

    // Contact Us
    $(
      'a[href*="contact"], a:contains("Contact"), a:contains("Contact Us")'
    ).each((_, element) => {
      if (!importantLinks.contactUs) {
        const href = $(element).attr("href");
        importantLinks.contactUs = href
          ? this.resolveUrl(href, baseUrl)
          : $(element).text().trim();
      }
    });

    // Blogs
    $(
      'a[href*="blog"], a[href*="news"], a:contains("Blog"), a:contains("News")'
    ).each((_, element) => {
      if (!importantLinks.blogs) {
        const href = $(element).attr("href");
        importantLinks.blogs = href
          ? this.resolveUrl(href, baseUrl)
          : $(element).text().trim();
      }
    });

    // Additional important links
    $('a[href*="shipping"], a:contains("Shipping")').each((_, element) => {
      if (!importantLinks.shipping) {
        const href = $(element).attr("href");
        importantLinks.shipping = href
          ? this.resolveUrl(href, baseUrl)
          : $(element).text().trim();
      }
    });

    $(
      'a[href*="size-guide"], a[href*="sizing"], a:contains("Size Guide")'
    ).each((_, element) => {
      if (!importantLinks.sizeGuide) {
        const href = $(element).attr("href");
        importantLinks.sizeGuide = href
          ? this.resolveUrl(href, baseUrl)
          : $(element).text().trim();
      }
    });

    return importantLinks;
  }

  private static async extractBlogPosts(
    $: cheerio.CheerioAPI,
    baseUrl: string
  ): Promise<Array<{ title: string; url: string; excerpt?: string }>> {
    const blogPosts: Array<{ title: string; url: string; excerpt?: string }> =
      [];

    // Find blog page link
    const blogLink = $(
      'a[href*="blog"], a[href*="news"], a:contains("Blog")'
    ).first();
    if (blogLink.length) {
      const href = blogLink.attr("href");
      if (href) {
        const fullUrl = this.resolveUrl(href, baseUrl);
        try {
          const blogPageContent = await this.fetchPageContent(fullUrl);
          const blogPage$ = cheerio.load(blogPageContent);

          // Extract blog posts from the blog page
          const postSelectors = [
            ".blog-post",
            ".post-item",
            ".article-item",
            ".news-item",
            "[data-post]",
          ];

          postSelectors.forEach((selector) => {
            blogPage$(selector).each((_, element) => {
              const title = blogPage$(element)
                .find(".post-title, .article-title, h2, h3")
                .first()
                .text()
                .trim();
              const postUrl = blogPage$(element).find("a").first().attr("href");
              const excerpt = blogPage$(element)
                .find(".excerpt, .summary, p")
                .first()
                .text()
                .trim();

              if (title && postUrl) {
                blogPosts.push({
                  title,
                  url: this.resolveUrl(postUrl, fullUrl),
                  excerpt:
                    excerpt.length > 0 ? excerpt.substring(0, 200) : undefined,
                });
              }
            });
          });
        } catch (error) {
          console.log(`Failed to fetch blog content from ${fullUrl}`);
        }
      }
    }

    return blogPosts.slice(0, 10); // Limit to 10 blog posts
  }

  // Helper method to resolve relative URLs
  private static resolveUrl(href: string, baseUrl: string): string {
    try {
      return new URL(href, baseUrl).toString();
    } catch {
      return href;
    }
  }

  // Helper method to fetch content from a page with better error handling
  private static async fetchPageContent(url: string): Promise<string> {
    try {
      const response = await axios.get(url, {
        timeout: 8000, // Increased timeout
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
        maxRedirects: 5, // Allow redirects
      });

      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch content from ${url}: ${error}`);
    }
  }
}
