import {HandleCallback} from "./base";
import {FunctionType} from "../../../common/type";

export async function ToolClick(input: Map<string, string>, data: { default_position: string }, callback: HandleCallback): Promise<Map<string, string>> {
    console.log("点击", input, data)
    await callback(FunctionType.Click, {id: input.get('tool_click_position') || data.default_position})

    return new Map()
}

export async function ToolInput(input: Map<string, string>, data: { default_position: string, default_text: string }, callback: HandleCallback): Promise<Map<string, string>> {
    console.log("输入", input, data)
    await callback(FunctionType.Input, {
        id: input.get('tool_input_position') || data.default_position,
        text: input.get('tool_input_text') || data.default_text
    })

    return new Map()
}

export async function ToolRemove(input: Map<string, string>, data: {default_position: string}, callback: HandleCallback): Promise<Map<string, string>> {
    console.log("移除", input, data)
    await callback(FunctionType.Remove, {id: input.get('tool_remove_position') || data.default_position})

    return new Map()
}

export async function ToolScroll(input: Map<string, string>, data: {default_scroll_val: number}, callback: HandleCallback): Promise<Map<string, string>> {
    console.log("滚动", input, data)
    await callback(FunctionType.Scroll, {value: Number(input.get('tool_scroll_value')) || data.default_scroll_val})

    return new Map()
}

export async function ToolGetText(input: Map<string, string>, data: {default_position: string}, callback: HandleCallback): Promise<Map<string, string>> {
    console.log("获取文本", input, data)

    return new Map([["tool_get_text_value", await callback(FunctionType.GetText, {id: input.get('tool_get_text_position') || data.default_position})]])
}

export async function ToolGetSelect(input: Map<string, string>, data: object, callback: HandleCallback): Promise<Map<string, string>> {
    console.log("获取选中", input, data)

    return new Map([['tool_get_select_content', await callback(FunctionType.GetSelect, data)]])
}

export async function ToolGetElement(input: Map<string, string>, data: {hint: string}, callback: HandleCallback): Promise<Map<string, string>> {
    console.log("获取元素", input, data)

    return new Map([['tool_get_element_position', await callback(FunctionType.GetElement, data)]])
}

export async function ToolOpenUrl(input: Map<string, string>, data: {default_url: string}, callback: HandleCallback): Promise<Map<string, string>> {
    console.log("打开网页", input, data)
    await callback(FunctionType.OpenUrl, {url: data.default_url.replace("$v", input.get('tool_open_url_value') || "")})

    return new Map()
}

export async function ToolGetMessage(input: Map<string, string>, data: object, callback: HandleCallback): Promise<Map<string, string>> {
    console.log("获取消息", input, data)

    return new Map([['tool_get_message_content', await callback(FunctionType.GetMessage, data)]])
}

export async function ToolSendMessage(input: Map<string, string>, data: {default_message: string}, callback: HandleCallback): Promise<Map<string, string>> {
    console.log("发送消息", input, data)
    await callback(FunctionType.SendMessage, {content: input.get('tool_send_message_content') || data.default_message})

    return new Map()
}

export async function ToolCallLlm(input: Map<string, string>, data: {params_num: number, prompt: string}, callback: HandleCallback): Promise<Map<string, string>> {
    console.log("调用模型", input, data)
    const param: any = {}
    for (let i = 1; i <= data.params_num; i++) {
        param[`arg${i}`] = input.get(`tool_call_llm_arg_${i}`) || ''
    }

    return new Map([['tool_call_llm_out', await callback(FunctionType.CallLlm, {prompt: data.prompt, data: param})]])
}