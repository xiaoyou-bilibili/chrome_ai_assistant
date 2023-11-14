import {HandleCallback} from "./base";
import {FunctionType} from "../../../common/type";

export async function BasicStart(input: Map<string, string>, data: object, _callback: HandleCallback): Promise<Map<string, string>> {
    console.log("开始节点", input, data)

    return new Map([['type', 'start']])
}

export async function BasicParam(input: Map<string, string>, data: {name: string, desc: string}, _callback: HandleCallback): Promise<Map<string, string>> {
    console.log("基本参数", input, data)

    return new Map([['basic_param_val', input.get(data.name) || ""]])
}


export async function BasicVariable(input: Map<string, string>, data: {variables: string[]}, _callback: HandleCallback): Promise<Map<string, string>> {
    console.log("变量", input, data)
    const response = new Map()
    for (let i = 0; i < data.variables.length; i++) {
        response.set(`basic_variable_${i+1}_out`, input.get(`basic_variable_${i+1}_in`) || data.variables[i])
    }

    return response
}

export async function BasicRuleEngine(input: Map<string, string>, data: {rules:{rule:string, out:string}[]}, _callback: HandleCallback): Promise<Map<string, string>> {
    console.log("规则引擎", input, data)

    return new Map([['basic_rule_engine_out', 'rule out']])
}

export async function BasicSwitch(input: Map<string, string>, data: {switch_info: string[]}, _callback: HandleCallback): Promise<Map<string, string>> {
    console.log("规则判断", input, data)
    const input_info = input.get("basic_switch_input") || ""
    const pass_edge = []
    for (let i = 0; i < data.switch_info.length; i++) {
        pass_edge.push(data.switch_info[i]==input_info?"basic_switch_after_default":`basic_switch_after_${i+1}`)
    }

    return new Map([['_pass_edge', pass_edge.join(",")]])
}

export async function BasicMemory(input: Map<string, string>, data: {name: string, desc: string, hint: string}, _callback: HandleCallback): Promise<Map<string, string>> {
    console.log("记忆节点", input, data)
    // 如果有输入，那么就保存
    if(input.has('basic_memory_in')) {
        // 提示是否保存
        let confirm = await _callback(FunctionType.Confirm, {hint: "记住该选择"})
        if(confirm == "true") {
            console.log("保存数据")
            await _callback(FunctionType.AddMemory, {name: data.desc, value: input.get('basic_memory_in')})
        }
    }

    return new Map([['basic_memory_out', input.get(data.name) || input.get('basic_memory_in') || '']])
}