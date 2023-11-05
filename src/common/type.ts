import {Edge, Node} from 'reactflow';
import {ToolGetSelect} from "../lib/flow_edit/func/tool";
export enum FunctionType {
    Input,
    Click,
    Remove,
    Scroll,
    GetText,
    GetSelect,
    OpenUrl,
    GetMessage,
    SendMessage,
    CallLlm,
    GetElement,
}

export interface HandleFunction{
    function_type: FunctionType
    param: any
}


export interface GraphInfo {
    id?: string  // id
    name: string // 名称
    desc: string // 描述
    nodes: Node[] // 节点
    edges: Edge[] // 边消息
}