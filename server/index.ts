// @ts-ignore
import express from "express"
// @ts-ignore
import cors from "cors"
import * as dotenv from "dotenv"
import { translate } from "./translate"
import fs from 'fs/promises';
dotenv.config()
const app = express()

app.use(express.json())
app.use(cors())

app.post("/prompt-studio/translate/prompts", async (req: any, res: any) => {
    let input: { words: string[]; to: string } = req.body
    let orgText = input.words.join("\n")
    const finText = await translate({ text: orgText, to: input.to ?? "zh-cn", server: "tencent" })

    if (finText) {
        let words = finText.split("\n")
        res.json(words)
    } else {
        res.json([])
    }
})

app.post('/api/updateLocalPromptDefineMap', async (req, res) => {
    const jsonData = req.body;
    const filePath = './data/localPromptDefineMap.json';
    // console.log(jsonData)
    try {
        const jsonString = JSON.stringify(jsonData, null, 2);
        await fs.writeFile(filePath, jsonString, 'utf8');
        res.status(200).json({ message: `JSON data has been written to: ${filePath}` });
    } catch (error) {
        res.status(500).json({ message: `Error writing JSON data to file: ${error}` });
    }
});


app.get("/api/localPromptDefineMap", async (req, res) => {
    const filePath = "./data/localPromptDefineMap.json";
    try {
        const fileBuffer = await fs.readFile(filePath);
        const jsonString = fileBuffer.toString();
        const jsonData = JSON.parse(jsonString);
        res.status(200).json(jsonData);
    } catch (error) {
        res.status(500).json({ message: `Error reading JSON data from file: ${error}` });
    }
});



const port = process.env.PORT || 19212
app.listen(port, () => {
    console.log(`Server started on port ${port}`)
})
