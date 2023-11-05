import {StorageKeyConfig} from "./const";
import {ChatOpenAI} from "langchain/chat_models/openai";
import {Runnable} from "langchain/dist/schema/runnable";

export async function GetOpenapi(model:string="gpt-3.5-turbo"): Promise<ChatOpenAI>  {
    let value = await chrome.storage.sync.get([StorageKeyConfig])
    console.log(value)
    return new ChatOpenAI({openAIApiKey: value.config.key, modelName: model, temperature: 0}, {baseURL: value.config.base})
}

export async function GetOpenapiWithFunctions(functions: any[], model:string="gpt-3.5-turbo"): Promise<Runnable>  {
    let value = await chrome.storage.sync.get([StorageKeyConfig])
    return new ChatOpenAI({openAIApiKey: value.config.key, modelName: model, temperature: 0}, {baseURL: value.config.base}).bind({functions})
}