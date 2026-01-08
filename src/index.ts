import express from "express";
import { Request, Response } from "express";
import './config.js';
import { stat } from "node:fs";

const app = express();
const PORT = process.env.PORT || 3000;
var config: APIConfig = {
    fileserverHits: 0,
};

app.use(middlewareLogResponses);
app.use("/app", middlewareMetricsInc, express.static("./src/app"));
app.get("/healthz",handleReadiness);
app.get("/metrics", handleHitsCounter);
app.get("/reset", handleResetCounter);

function handleReadiness(req: Request, res: Response) {
    res.set("Content-Type", "text/plain");
    res.status(200).send("OK");
}

function middlewareLogResponses(req: Request, res: Response, next: () => void) {
    res.on("finish", () => {
        const statusCode = res.statusCode;
        if (statusCode !== 200) {
            console.log(`[NON-OK] ${req.method} ${req.originalUrl} - Status: ${statusCode}`);
        }
    });

    next();
}

function middlewareMetricsInc(req: Request, res: Response, next: () => void) {
  config.fileserverHits += 1;
  next();
}

function handleResetCounter(req: Request, res: Response) {
    config.fileserverHits = 0;
    res.set("Content-Type", "text/plain");
    res.status(200).send(`Hits counter reset to 0\n`);
}

function handleHitsCounter(req: Request, res: Response) {
    res.set("Content-Type", "text/plain");
    res.status(200).send(`Hits: ${config.fileserverHits}\n`);
}

app.listen(PORT, () =>{
    console.log(`Server is running on http://localhost:${PORT}`);
});

