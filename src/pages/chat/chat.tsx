import React, {useEffect, useRef, useState} from "react";
import {ChatOpenAI} from "langchain/chat_models/openai";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import {
    ChatContainer,
    ConversationHeader,
    MainContainer,
    Message,
    MessageInput,
    MessageList
} from "@chatscope/chat-ui-kit-react";
import {Button, Select, Space} from "@douyinfe/semi-ui";
import {MarkDownMessage} from "../../component/markdown";
import {GraphInfo} from "../../common/type";
import {GetAllData, GetData, storeNameMemory} from "../../common/db";
import {AIMessage, BaseMessage, HumanMessage, SystemMessage} from "langchain/schema";
import {executeFunction} from "../../lib/flow_edit/engine";
import {serverExecuteFunctionWarp} from "../../lib/web/server";
import './chat.css'
import {GetOpenapi, GetOpenapiWithFunctions} from "../../common/llm";
import {IconDelete} from "@douyinfe/semi-icons";
import { BufferWindowMemory } from "langchain/memory";
import {getCurrentTab} from "../../common/utils";
import {MemoryVariables} from "langchain/dist/memory/base";
import {ChatPromptTemplate} from "langchain/prompts";
import {StringOutputParser} from "langchain/schema/output_parser";

export default function Chat() {
    const [messageList, setMessageList] = useState([<Message key={1} model={{direction: "incoming", message: "请问有什么可以帮助你的？", position: "single"}}></Message>])
    const [functionList, setFunctionList] = useState<any[]>([])
    const [graphList, setGraphList] = useState<GraphInfo[]>([])
    const [skills, setSkills] = useState<string[]>(['all'])
    const memory = useRef(new BufferWindowMemory({k: 4, returnMessages: true}))
    const [currentMode, setCurrentMode] = useState(1)

    const addRobotMessage = (content: string) => {
        setMessageList(messageList => [...messageList, <MarkDownMessage key={messageList.length+1} content={content} />])
    }

    const addHumanMessage = (content: string) => {
        setMessageList(messageList => [...messageList, <Message key={messageList.length+1} model={{direction: "outgoing", message: content, position: "single"}}></Message>])
    }

    const simpleMode = async (msg: string, current_web: chrome.tabs.Tab, history: MemoryVariables) => {
        let model = await GetOpenapiWithFunctions(functionList)
        // 查询数据库
        let data = await GetData<{[key:string]:string}>(current_web.url||"", storeNameMemory)
        let contextInfo = []
        for (let key in data) {
            contextInfo.push(`${key}:${data[key]}`)
        }

        const inputs = [
            new SystemMessage("你是一个实用的网页助手，你可以执行不同的函数来完成用户的需求，如果用户表述不清楚，可以给出一个最可能的选项让用户来选择\n" +
                "注意：\n1.不要透露你的身份，假装你是一个人\n 2.不要直接把函数给暴露出去，只能你来执行\n"+
                `上下文信息：\n ${contextInfo.join("\n")}`),
            ...history.history,
            new HumanMessage(msg)
        ]
        console.log("gpt输入", inputs, functionList)
        let res = await model.invoke(inputs)

        let function_call = res.additional_kwargs.function_call
        let function_name = ""
        if(function_call) {
            function_name = function_call.name
            const args = JSON.parse(function_call.arguments)
            const param = new Map<string, string>(Object.entries(args))
            let graph = graphList.find(graph => graph.name == function_name)
            if(graph) {
                addRobotMessage(`调用 \`${function_name}\`技能中， 参数信息 \n\`\`\`json\n${JSON.stringify(args, null, 2)}\n\`\`\``)
                executeFunction(param, graph.nodes, graph.edges, serverExecuteFunctionWarp({
                    message_callback: message => addRobotMessage(message),
                    get_message: () => msg,
                })).then(r => {
                    addRobotMessage("执行完毕")
                })
            }
        } else {
            addRobotMessage(res.content)
        }
        await memory.current.saveContext({input: msg}, {output: res.content || `执行函数 ${function_name}`})
    }

    const multiFuncMode = async (msg: string, current_web: chrome.tabs.Tab, history: MemoryVariables) => {
        const system = `你是一个功能强大的网页助手，用户输入需求，你可以结合背景知识和函数列表把用户的需求进行拆解为多个执行步骤并输出

下面我会给出说明和返回格式，你需要严格按照返回的格式来进行返回，如果通过函数或者背景知识无法解决用户需求,不要询问用户，直接返回none
## 说明
函数格式： '函数名称[函数描述](参数1:参数描述1,参数2:参数描述2)'。例如: video[去视频平台搜索内容](desc:内容关键词)
不同函数会用换行隔开，你可以根据函数描述和参数描述来选择不同的函数去执行

## 返回格式
你需要返回一个函数的列表，不要返回其他的内容，不要返回函数说明和其他无关信息，不同函数用换行隔开，函数的格式如下: 函数名称(参数1:参数1的值,参数2:参数2的值) 

### 例子
函数列表：
video[到视频网站上查看视频](desc:视频描述)
weather[查询某个地方的天气](city:城市,date:日期，输入2023-11-08的格式)

用户输入：
我要看轻音少女，顺便查一下明天上海的天气

输出：
video(desc:轻音少女)
weather(city:上海,date:2023-11-08)

说明：
表示第一步执行video函数，参数desc的值为轻音少女，第二步执行weather函数，参数city为上海，date为2023-11-08

## 背景知识
今天是2023年11月8号
小游的用户id是556

## 函数列表
google[在搜索引擎上搜索内容](desc:关键词)
shop[在购物网站上进行购物](name:物品名称,num:物品数量)
chat[和某人聊天](user_id:用户id,content:内容)`
        const chain = ChatPromptTemplate.fromMessages([
            ["system", system],
            ...history.history.map((msg: BaseMessage) => [msg._getType(), msg.content]),
            ["human", msg]
        ]).pipe(await GetOpenapi("gpt-4")).pipe(new StringOutputParser());
        let resp = await chain.invoke({});
        await memory.current.saveContext({input: msg}, {output: resp})
    }

    const onSend = async (msg: string) =>{
        addHumanMessage(msg)
        let history = await memory.current.loadMemoryVariables({})
        // 获取当前网页数据
        let current_web = await getCurrentTab()
        switch (currentMode) {
            case 1:
               await simpleMode(msg, current_web, history)
                break
            case 2:
                await multiFuncMode(msg, current_web, history)
                break

        }
    }

    useEffect(() => {
        GetAllData<GraphInfo>().then(setGraphList)
    }, [])

    useEffect(() => {
        // 先提取出所有的关键词
        const isAll = skills.includes("all")
        if(skills) {
            let params = graphList.filter(graph => isAll || skills.includes(graph.id!)).map(graph => {
                let required:string[] = []
                let properties: {[key:string]:{type:string, description: string}} = {}
                graph.nodes.filter(node => ["basic_param", "basic_memory"].includes(node.type!)).reduce((result,current) => {
                    result[current.data.name] = {
                        type: "string",
                        description: `${current.data.desc}${current.type == 'basic_memory'?",你需要从上下文中进行获取，如果没有直接返回空字符串":""}`
                    }
                    required.push(current.data.name)
                    return result
                }, properties)
                return { name: graph.name, description: graph.desc, parameters: {type: "object", properties: properties, required: required}}
            })
            console.log(params)
            setFunctionList(params)
        }
    }, [skills, graphList])

    // 清空消息
    const cleanMessage = () => {
        memory.current.clear().then(_ => {
            setMessageList([])
            addRobotMessage("上下文已清空，请继续和我对话吧！")
        })
    }

    // 下拉框被选中
    const skillChange = (items: string[]) => {
        setSkills(items)
    }

    const test = () => {
        // memory.current.chatHistory.addUserMessage("123")
        // memory.current.chatHistory.addAIChatMessage("456")
        // memory.current.chatHistory.addUserMessage("789")
        // memory.current.chatHistory.addUserMessage("110")
        // console.log(memory.current.chatHistory.getMessages().then(res => {
        //     console.log("消息列表", res)
        // }))
        memory.current.saveContext({input: new HumanMessage("123")}, {output: new AIMessage("456")})

        // memory.current.saveContext({input: new HumanMessage("123")}, {}).then(res => {
        //     console.log("成功", res)
        // })
        // memory.current.loadMemoryVariables({}).then(res => {
        //     console.log("加载", res)
        // })
        // memory.current.chatHistory.add
    }

    return (
        <>
            <MainContainer>
                <ChatContainer>
                    <ConversationHeader><ConversationHeader.Content userName="大语言网页助手" info="by:小游" /></ConversationHeader>
                    <MessageList>{messageList}</MessageList>
                    {/*@ts-ignore*/}
                    <div as={MessageInput} style={{borderTop: "1px dashed #d1dbe4"}}>
                        <Space style={{margin: 5}}>
                            <Button icon={<IconDelete />} type={"primary"} onClick={cleanMessage} />
                            {/*<Button type={"primary"} onClick={test}>测试</Button>*/}
                            <Select multiple insetLabel={"技能"} onChange={skillChange} maxTagCount={1} style={{width: 180}} value={skills}>
                                <Select.Option value="all">全部</Select.Option>
                                {graphList.map(graph => <Select.Option value={graph.id}>{graph.name}</Select.Option>)}
                            </Select>
                            <Select insetLabel={"模式"} onSelect={setCurrentMode} value={currentMode} style={{width: 120}}  defaultValue="simple">
                                <Select.Option value={1}>单技能</Select.Option>
                                <Select.Option value={2}>多技能</Select.Option>
                                <Select.Option value={3}>自主规划</Select.Option>
                            </Select>
                        </Space>
                        <MessageInput style={{borderTop: 0}} placeholder="随便输点什么吧" attachButton={false} onSend={onSend} />
                    </div>
                </ChatContainer>
            </MainContainer>
        </>
    )
}


