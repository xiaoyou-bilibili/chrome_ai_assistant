import {BasicMemory, BasicParam, BasicRuleEngine, BasicStart, BasicSwitch, BasicVariable} from "./func/basic";
import {
    ToolCallLlm,
    ToolClick, ToolGetElement, ToolGetMessage, ToolGetSelect,
    ToolGetText,
    ToolInput,
    ToolOpenUrl,
    ToolRemove,
    ToolScroll,
    ToolSendMessage
} from "./func/tool";
import {HandleCallback} from "./func/base";
import {Edge, Node} from 'reactflow';

const handleMap = new Map<string, any>([
    ['basic_param', BasicParam],
    ['basic_variable', BasicVariable],
    ['basic_rule_engine', BasicRuleEngine],
    ['basic_switch', BasicSwitch],
    ['basic_memory', BasicMemory],
    ['tool_click', ToolClick],
    ['tool_input', ToolInput],
    ['tool_remove', ToolRemove],
    ['tool_scroll', ToolScroll],
    ['tool_get_text', ToolGetText],
    ['tool_open_url', ToolOpenUrl],
    ['basic_start', BasicStart],
    ['tool_call_llm', ToolCallLlm],
    ['tool_send_message', ToolSendMessage],
    ['tool_get_message', ToolGetMessage],
    ['tool_get_select', ToolGetSelect],
    ['tool_get_element', ToolGetElement],
])

export async function executeFunction(global: Map<string, string>, nodes: Node<object>[], edges: Edge[], callback: HandleCallback) {
    const preEdges = new Map<string, Edge[]>(), nextEdge = new Map<string, Edge[]>(), nodeInfo = new Map<string, Node<object>>()
    // 获取当前节点的前一个节点和后一个节点
    edges.forEach(edge => {
        preEdges.has(edge.target)? preEdges.get(edge.target)!.push(edge):preEdges.set(edge.target, [edge])
        nextEdge.has(edge.source)? nextEdge.get(edge.source)!.push(edge):nextEdge.set(edge.source, [edge])
    })
    nodes.forEach(node => nodeInfo.set(node.id, node))

    // 只能有一个开始节点
    const startNodes = nodes.filter(node => node.type == "basic_start")
    if(startNodes.length != 1) {
        console.log("只能有一个开始节点")
        return
    }
    // 直接执行开始节点
    await executeNode(startNodes[0].id, global, nodeInfo, preEdges, nextEdge, new Map, callback)
}
async function executeNode(
    current: string,
    global: Map<string, string>,
    nodes: Map<string, Node<object>>,
    preEdges: Map<string, Edge[]>,
    nextEdges: Map<string, Edge[]>,
    outMap: Map<string, Map<string, string>>,
    callback: HandleCallback
): Promise<Map<string, string>> {
    // 如果节点执行过就直接返回结果
    if(outMap.has(current)) {
        return outMap.get(current)!
    }
    outMap.set(current, new Map)
    const inputs = new Map
    // 执行前一个节点
    let executePre = true
    // 如果当前的节点是基本参数或记忆节点，那么还需要把全局参数塞进去
    const currentNode = nodes.get(current)!
    if(['basic_param', 'basic_memory'].includes(currentNode.type!)) {
        global.forEach((value, key) => {inputs.set(key, value)})
        // 记忆节点会判断有没有值，如果有就不执行前一个节点
        if(currentNode.type == 'basic_memory' && global.get(currentNode.data.name)) {
            executePre = false
        }
    }

    // 获取当前节点的前一个节点
    if(preEdges.has(current) && executePre) {
        for (const edge of preEdges.get(current)!) {
            // 只获取非流程的输入，避免往前执行
            if(edge.sourceHandle == 'base_after') {continue}
            // 执行前一个节点获取输出
            const output = await executeNode(edge.source, global, nodes, preEdges, nextEdges, outMap, callback)
            // 不为空才插入
            if(output.get(edge.sourceHandle!)) {inputs.set(edge.targetHandle, output.get(edge.sourceHandle!))}
        }
    }

    // 执行当前节点获取输出
    const outputs = await handleMap.get(currentNode.type!)(inputs, currentNode!.data, callback)
    outMap.set(current, outputs)

    // 执行当前节点下一个节点
    if(nextEdges.has(current)) {
        // 如果输出有跳过的节点那么就直接pass掉
        const passEdge = new Set()
        if(outputs.has('_pass_edge')) {
            const passNode: string[] = []
            outputs.get('_pass_edge')?.split(",").forEach((edge:string) => passEdge.add(edge))
            nextEdges.get(current)?.forEach(edge=>{
                if(passEdge.has(edge.sourceHandle)) {
                    outMap.set(edge.target, new Map)
                    passNode.push(edge.target)
                }
            })
            console.log("跳过节点", passNode)
        }

        for (const edge of nextEdges.get(current)!) {
            // 只执行没有执行过的，下一个节点只执行下一边
            // && edge.sourceHandle == "base_after"
            if(!outMap.has(edge.target)) {
                await executeNode(edge.target, global, nodes, preEdges, nextEdges, outMap, callback)
            }
        }
    }

    return outputs
}