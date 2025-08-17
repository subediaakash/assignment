import express from "express";
import morgan from "morgan";
import { scrappingRouter } from "./modules/scrapper/scrapper.route";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/v1", scrappingRouter);
app.get("/health-check", (req, res) => {
  res.send("Welcome to the Scrapper API");
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
