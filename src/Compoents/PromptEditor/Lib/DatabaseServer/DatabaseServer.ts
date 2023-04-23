import { fetchFromNotion } from "./lib/fetchFromNotion"
import { EventBus } from "../../../../Global/eventBus"
import axios from 'axios';

export interface IPromptDefineItem {
    text: string
    subType?: string
    desc?: string
    dir?: string
    lang_zh?: string
    sampleCmds?: string[]
    isAlias?: boolean
    tags?: string[]
}

export class DatabaseServer {
    localPromptDefineMap: { [key: string]: IPromptDefineItem } = {}
    notionPromptDefineMap: { [key: string]: IPromptDefineItem } = {}
    isReady: null | Promise<boolean> = null
    constructor() { }
    async ready() {
        if (this.isReady != null) return this.isReady
        this.isReady = this.init()
        return this.isReady
    }
    async init() {
        // localJson
        async function fetchData() {
            try {
                const response = await axios.get("http://localhost:19212/api/localPromptDefineMap");
                const localPromptDescMap = await response.data;
                // console.log("Local prompt description map:", localPromptDescMap);
                return localPromptDescMap
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        }

        this.localPromptDefineMap = await fetchData();
        return true
    }
    async queryPromptsDefine(prompts: string[]): Promise<IPromptDefineItem[]> {
        await this.ready()
        let reuslt = []
        for (let prompt of prompts) {
            let re = this.localPromptDefineMap[prompt?.toLowerCase()]
            if (re) {
                reuslt.push(re)
            } else {
                reuslt.push(null)
            }
        }
        return <any>reuslt
    }

    async getPromptsDefine(options?: { onlyMyNotion?: boolean }) {
        await this.ready()
        if (options?.onlyMyNotion) {
            return this.notionPromptDefineMap
        } else {
            return this.localPromptDefineMap
        }
    }

    async fetchNotion(options: { apiKey: string; databaseId: string }) {
        console.log("fetchNotion options", options)
        // let { defineMap, me } = await fetchFromNotion(options)
        // this.notionPromptDefineMap = defineMap
        // Object.assign(this.localPromptDefineMap, defineMap)
        // return { defineMap, me }
    }

    async updatePrompt(text: string, options: {dir: string; lang_zh: string, subType:string} ) {
        let prompt = this.localPromptDefineMap[`${text.toLowerCase()}`]
        if (prompt == null) {
            prompt = {
                text: text,
                dir: options.dir ?? '默认',
                lang_zh: options.lang_zh,
                subType: options.subType ?? 'normal'
            }
            this.localPromptDefineMap[`${text.toLowerCase()}`] = prompt
        }
        else {
            prompt.text = text
            prompt.dir = options.dir ?? prompt.dir
            prompt.lang_zh = options.lang_zh ?? prompt.lang_zh
            prompt.subType = options.subType ?? prompt.subType
        }
        try {
            const response = await axios.post('http://localhost:19212/api/updateLocalPromptDefineMap', this.localPromptDefineMap);
            // console.log(response.data.message);
            EventBus.$emit("databaseServer", "update");
        } catch (error) {
            console.error('Error sending JSON data to server:', error);
        }
    }

    async deletePrompt(text?: string) {
        if (text == null) {
            return
        }
        delete (this.localPromptDefineMap[`${text.toLowerCase()}`])
        try {
            const response = await axios.post('http://localhost:19212/api/updateLocalPromptDefineMap', this.localPromptDefineMap);
            // console.log(response.data.message);
            EventBus.$emit("databaseServer", "remove");
        } catch (error) {
            console.error('Error sending JSON data to server:', error);
        }
    }
}

let databaseServer: DatabaseServer
export function useDatabaseServer() {
    if (!databaseServer) databaseServer = new DatabaseServer()
    return databaseServer
}
