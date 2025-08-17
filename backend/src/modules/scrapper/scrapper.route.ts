import { Router } from "express";
import { ScrapperController } from "./scrapper.controller";

export const scrappingRouter = Router();

scrappingRouter.post(
  "/scrape",
  ScrapperController.scrape.bind(ScrapperController)
);

scrappingRouter.get(
  "/data/:url",
  ScrapperController.getScrapedData.bind(ScrapperController)
);

scrappingRouter.get(
  "/websites",
  ScrapperController.getAllScrapedWebsites.bind(ScrapperController)
);
