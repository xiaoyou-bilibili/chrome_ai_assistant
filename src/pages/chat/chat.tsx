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
import {Button, Space} from "@douyinfe/semi-ui";
import {MarkDownMessage} from "../../component/markdown";
import {GraphInfo} from "../../common/type";
import {GetAllData} from "../../common/db";
import {AIMessage, BaseMessage, HumanMessage, SystemMessage} from "langchain/schema";
import {executeFunction} from "../../lib/flow_edit/engine";
import {serverExecuteFunctionWarp} from "../../lib/web/server";
import './chat.css'
import {GetOpenapiWithFunctions} from "../../common/llm";
import {IconDelete} from "@douyinfe/semi-icons";

export default function Chat() {
    const [messageList, setMessageList] = useState([<Message key={1} model={{direction: "incoming", message: "请问有什么可以帮助你的？", position: "single"}}></Message>])
    const [functionList, setFunctionList] = useState<any[]>([])
    const [graphList, setGraphList] = useState<GraphInfo[]>([])
    const [openapiMessageList, setOpenapiMessageList] = useState<BaseMessage[]>([])

    const addRobotMessage = (content: string) => {
        setMessageList(messageList => [...messageList, <MarkDownMessage key={messageList.length+1} content={content} />])
    }

    const addHumanMessage = (content: string) => {
        setMessageList(messageList => [...messageList, <Message key={messageList.length+1} model={{direction: "outgoing", message: content, position: "single"}}></Message>])
    }

    const onSend = (msg: string) =>{
        addHumanMessage(msg)
        console.log(openapiMessageList)
        GetOpenapiWithFunctions(functionList).then(model => {
            model.invoke([
                new SystemMessage("你是一个实用的网页助手，你可以执行不同的函数来完成用户的需求，如果用户表述不清楚，可以给出一个最可能的选项让用户来选择\n" +
                    "注意：1.不要透露你的身份，假装你是一个人\n 2.不要直接把函数给暴露出去，只能你来执行"),
                ...openapiMessageList,
                new HumanMessage(msg)
            ]).then(res => {
                setOpenapiMessageList(messages => [...messages, new HumanMessage(msg)])
                let function_call = res.additional_kwargs.function_call
                if(function_call) {
                    const name = function_call.name
                    const args = JSON.parse(function_call.arguments)
                    const param = new Map<string, string>(Object.entries(args))
                    let graph = graphList.find(graph => graph.name == name)
                    if(graph) {
                        addRobotMessage(`调用 \`${name}\`技能中， 参数信息 \n\`\`\`json\n${JSON.stringify(args, null, 2)}\n\`\`\``)
                        executeFunction(param, graph.nodes, graph.edges, serverExecuteFunctionWarp({
                            message_callback: message => addRobotMessage(message),
                            get_message: () => msg,
                        })).then(r => {
                            addRobotMessage("执行完毕")
                        })
                    }
                } else if ( res.content ) {
                    addRobotMessage(res.content)
                    setOpenapiMessageList(messages => [...messages, new AIMessage(res.content)])
                }
                console.log(res)
            })
        })
    }

    useEffect(() => {
        GetAllData<GraphInfo>().then(graphs => {
            setGraphList(graphs)
            // 先提取出所有的关键词
            let params = graphs.map(grah => {
                let required:string[] = []
                let properties = grah.nodes.filter(node => node.type == "basic_param").reduce((result,current) => {
                    // @ts-ignore
                    result[current.data.name] = {type: "string", description: current.data.desc}
                    required.push(current.data.name)
                    return result
                }, {})
                return { name: grah.name, description: grah.desc, parameters: {type: "object", properties: properties, required: required}}
            })
            console.log(params)
            setFunctionList(params)
        })
        // addRobotMessage("调用技能`bilibili`成功，参数 \n ```python\n print('hello')\n``` \n sdsd")
    }, [])

    const cleanMessage = () => {
        setOpenapiMessageList([])
        setMessageList([])
        addRobotMessage("上下文已清空，请继续和我对话吧！")
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
                        </Space>
                        <MessageInput style={{borderTop: 0}} placeholder="随便输点什么吧" attachButton={false} onSend={onSend} />
                    </div>
                </ChatContainer>
            </MainContainer>
        </>
    )
}


