import {FunctionType, HandleFunction} from "../../common/type";
import {HandleCallback} from "../flow_edit/func/base";
import {ChatPromptTemplate} from "langchain/prompts";
import {StringOutputParser} from "langchain/schema/output_parser";
import {GetOpenapi} from "../../common/llm";

export interface serverExecuteCallback {
    message_callback: (message: string) => void
    get_message: () => string
}

export function serverExecuteFunctionWarp(callback: serverExecuteCallback): HandleCallback {
    return async (type: FunctionType, data: any): Promise<string> => {
        switch (type) {
            case FunctionType.SendMessage:
                callback.message_callback(data.content)
                break
            case FunctionType.GetMessage:
                return callback.get_message()
            default:
               return serverExecuteFunction(type, data)
        }
        return ""
    }
}

export async function serverExecuteFunction (type: FunctionType, data: any): Promise<string> {
    // 有几个默认是本地的操作
    switch (type) {
        case FunctionType.OpenUrl:
            // 等待网页创建完成才执行下一步
            await createTabAndWait(data.url)
            break
        case FunctionType.CallLlm:
            const chain = ChatPromptTemplate.fromMessages([
                ["system", data.prompt]
            ]).pipe(await GetOpenapi("gpt-3.5-turbo-16k")).pipe(new StringOutputParser());
            return chain.invoke(data.data);
        default:
            // 否则就是在当前页面执行代码
            return sendMessage({function_type: type, param: data})
    }
    return ""
}

// 发送消息
function sendMessage(info: HandleFunction): Promise<string> {
    return new Promise((resolve, reject) => {
        chrome.tabs.query({ active: true }, function(tabs) {
            let currentTab = tabs.filter(tab => !tab.url?.includes("chrome-extension"));
            if (currentTab.length == 0) {reject('not found');return}
            chrome.tabs.sendMessage(currentTab[0].id!, info).then(resolve);
        })
        return ""
    })
}

// 打开网页，并且等待加载完成
function createTabAndWait(url: string) {
    return new Promise((resolve) => {
        if(!url.endsWith("/")) url += "/"
        // 先查询一下网页是否存在，不存在才创建
        chrome.tabs.query({url}, function (tabs) {
            console.log(tabs)
            if(tabs && tabs.length >0 ) {
                chrome.tabs.update(tabs[0].id!, {active: true}).then(() => {
                    setTimeout(()=>resolve(''), 500)
                })
            } else {
                chrome.tabs.create({ url }, (tab) => {
                    const listener = (tabId: number, changeInfo: any) => {
                        if (tabId === tab.id && changeInfo.status === 'complete') {
                            chrome.tabs.onUpdated.removeListener(listener);
                            resolve('');
                        }
                    };
                    chrome.tabs.onUpdated.addListener(listener);
                });
            }
        })
    });
}
