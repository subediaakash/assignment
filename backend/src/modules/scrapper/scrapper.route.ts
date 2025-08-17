import { Router } from "express";
import { ScrapperController } from "./scrapper.controller";

export const scrappingRouter = Router();

scrappingRouter.post(
  "/scrape",
  ScrapperController.scrape.bind(ScrapperController)
);
