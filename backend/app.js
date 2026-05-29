import express from "express";
import { healthCheck } from "./src/controllers/healthcheck";
import { checkconnection } from "./src/controllers/checknetwork";


const app = express();

app.get("/healthcheck", healthCheck);
app.get("/", checkconnection);

export default app;