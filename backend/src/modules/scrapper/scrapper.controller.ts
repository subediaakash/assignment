import { ScrapperService } from "./scrapper.service";
import { ScrapperDatabase } from "./scrapper.database";
import type { Request, Response } from "express";

export class ScrapperController {
  static async scrape(req: Request, res: Response): Promise<void> {
    const { url } = req.body;
    if (!url) {
      res.status(400).json({ error: "URL is required" });
      return;
    }

    try {
      // Scrape the website
      const scrapedData = await ScrapperService.scrape(url);

      const savedWebsite = await ScrapperDatabase.saveScrapedData(
        url,
        scrapedData
      );

      res.status(200).json({
        success: true,
        data: scrapedData,
        websiteId: savedWebsite.id,
        message: "Website scraped and saved successfully",
      });
    } catch (error) {
      console.error("Error in ScrapperController:", error);
      res.status(500).json({
        error: "Failed to scrape the URL",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  static async getScrapedData(req: Request, res: Response): Promise<void> {
    const { url } = req.params;

    if (!url) {
      res.status(400).json({ error: "URL parameter is required" });
      return;
    }

    try {
      const scrapedData = await ScrapperDatabase.getScrapedData(
        decodeURIComponent(url)
      );

      if (!scrapedData) {
        res.status(404).json({ error: "No scraped data found for this URL" });
        return;
      }

      res.status(200).json({
        success: true,
        data: scrapedData,
      });
    } catch (error) {
      console.error("Error getting scraped data:", error);
      res.status(500).json({
        error: "Failed to retrieve scraped data",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  static async getAllScrapedWebsites(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const websites = await ScrapperDatabase.getAllScrapedWebsites();

      res.status(200).json({
        success: true,
        data: websites,
        count: websites.length,
      });
    } catch (error) {
      console.error("Error getting all scraped websites:", error);
      res.status(500).json({
        error: "Failed to retrieve scraped websites",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}
