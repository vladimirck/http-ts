import express from "express";
import { Request, Response } from "express";
import './config.js';
import { stat } from "node:fs";

const app = express();
const PORT = process.env.PORT || 3000;
const API = "/api";
const ADMIN = "/admin";
var config: APIConfig = {
    fileserverHits: 0,
};

app.use(middlewareLogResponses);
app.use("/app", middlewareMetricsInc, express.static("./src/app"));
app.get(API + "/healthz",handleReadiness);
app.get(ADMIN + "/metrics", handleHitsCounter);
app.post(ADMIN + "/reset", handleResetCounter);
app.post(API + "/validate_chirp", handleValidateChirp);

function handleValidateChirp(req: Request, res: Response) {
    var reqBody = '';
    req.on('data', (chunk) => {
        reqBody += chunk;
    });

    req.on('end', () => {
        var chirp: {body:string, error?:string};
        try{
            chirp = JSON.parse(reqBody);
        } catch (e) {
            res.set("Content-Type", "application/json");
            res.status(400).send(JSON.stringify({ error: "Something went wrong" }));
            return;
        }
        
        if (!chirp.body){
            res.set("Content-Type", "application/json");
            res.status(400).send(JSON.stringify({ error: "Something went wrong" }));
            return;
        }

        if (chirp.body.length > 140) {
            res.set("Content-Type", "application/json");
            res
              .status(400)
              .send(JSON.stringify({ error: "Chirp is too long" }));
            return;
        }
        
        res.set("Content-Type", "application/json");
        res.status(200).send(JSON.stringify({ valid: true }));
    });
    
}

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
    res.set("Content-Type", "text/html; charset=UTF-8");
    res.status(200).send(
        `<html>
            <body>
                <h1>Welcome, Chirpy Admin</h1>
                <p>Chirpy has been visited ${config.fileserverHits} times!</p>
            </body>
        </html>`
    );
}

app.listen(PORT, () =>{
    console.log(`Server is running on http://localhost:${PORT}`);
});

