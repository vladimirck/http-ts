import express from "express";
import { Request, Response } from "express";

const app = express();
const PORT = process.env.PORT || 3000;

app.use("/app", express.static("./src/app"));
app.get("/healthz",handleReadiness);

function handleReadiness(req: Request, res: Response) {
    res.set("Content-Type", "text/plain");
    res.status(200).send("OK");
}

app.listen(PORT, () =>{
    console.log(`Server is running on http://localhost:${PORT}`);
});

