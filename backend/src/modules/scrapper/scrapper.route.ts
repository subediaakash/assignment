import { Router } from "express";
import { ScrapperController } from "./scrapper.controller";
import { authMiddleware } from "../auth/auth.middleware";

export const scrappingRouter = Router();

// All scraper routes require authentication
scrappingRouter.post(
  "/scrape",
  authMiddleware,
  ScrapperController.scrape.bind(ScrapperController)
);

scrappingRouter.get(
  "/data/:url",
  authMiddleware,
  ScrapperController.getScrapedData.bind(ScrapperController)
);

scrappingRouter.get(
  "/websites",
  authMiddleware,
  ScrapperController.getAllScrapedWebsites.bind(ScrapperController)
);

// work done and subbmitted by : contact.aakash77@gmail.com , please dont copy
