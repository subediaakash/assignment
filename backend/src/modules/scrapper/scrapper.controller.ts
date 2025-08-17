import { ScrapperService } from "./scrapper.service";
import type { Request, Response } from "express";

export class ScrapperController {
  static async scrape(req: Request, res: Response): Promise<void> {
    const { url } = req.body;
    if (!url) {
      res.status(400).json({ error: "URL is required" });
      return;
    }

    try {
      const scrapedData = await ScrapperService.scrape(url);
      res.status(200).json({
        success: true,
        data: scrapedData,
      });
    } catch (error) {
      console.error("Error in ScrapperController:", error);
      res.status(500).json({ error: "Failed to scrape the URL" });
    }
  }
}
