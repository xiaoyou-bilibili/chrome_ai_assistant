import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import ReactFlow, {
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge, Panel, useStoreApi, ReactFlowProvider, MarkerType,
    Edge
} from 'reactflow';
import 'reactflow/dist/style.css';
import {BasicParam, BasicRuleEngine, BasicStart, BasicSwitch, BasicVariable} from "./nodes/basic";
import {
    ToolCallLlm,
    ToolClick, ToolGetElement, ToolGetMessage, ToolGetSelect,
    ToolGetText,
    ToolInput,
    ToolOpenUrl,
    ToolRemove,
    ToolScroll,
    ToolSendMessage
} from "./nodes/tool";
import {Button, Col, Collapse, Input, Modal, Row, Space, TextArea, Toast} from "@douyinfe/semi-ui";
import {
    IconChainStroked,
    IconDeleteStroked,
    IconEdit2Stroked, IconElementStroked, IconFingerLeftStroked, IconFixedStroked,
    IconHelpCircleStroked, IconInheritStroked,
    IconInteractiveStroked, IconMailStroked,
    IconPlay, IconSave, IconSaveStroked, IconSendStroked, IconSortStroked,
    IconTestScoreStroked, IconTrueFalseStroked
} from "@douyinfe/semi-icons";
import {executeFunction} from "./engine";
import './edit.css'
import {serverExecuteFunctionWarp} from "../web/server";
import {AddData, GetData, SaveData} from "../../common/db";
import {GraphInfo} from "../../common/type";
import {getUrlParam} from "../../common/utils";

export default  function FlowEdit() {
    return (
        <ReactFlowProvider>
            <Flow />
        </ReactFlowProvider>
    );
}

function Flow() {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [selectedNodeId, setSelectedNodeId] = useState('')
    const [selectedEdgeId, setSelectedEdgeId] = useState('')
    const [offset, setOffset] = useState(0)
    const store = useStoreApi();
    const [graph, setGraph] = useState<GraphInfo>({name: '', desc: '', nodes: [], edges: []})
    const regex =  /^[a-zA-Z0-9]+$/;

    // 加载所有插件
    const nodeTypes = useMemo(() => ({
        basic_start: BasicStart,
        basic_param: BasicParam,
        basic_variable: BasicVariable,
        basic_rule_engine: BasicRuleEngine,
        basic_switch: BasicSwitch,
        tool_click: ToolClick,
        tool_input: ToolInput,
        tool_remove: ToolRemove,
        tool_scroll: ToolScroll,
        tool_get_text: ToolGetText,
        tool_open_url: ToolOpenUrl,
        tool_send_message: ToolSendMessage,
        tool_call_llm: ToolCallLlm,
        tool_get_message: ToolGetMessage,
        tool_get_select: ToolGetSelect,
        tool_get_element: ToolGetElement
    }), []);
    // 自动给节点加上边消息
    const onConnect = useCallback((params: Edge) => setEdges((eds) => {
        params.markerEnd = { type: MarkerType.ArrowClosed }
        return addEdge(params, eds)
    }), [setEdges]);

    // 添加节点
    const addNode = (type: string) => {
        const {
            height,
            width,
            transform: [transformX, transformY, zoomLevel]
        } = store.getState();
        const zoomMultiplier = 1 / zoomLevel;
        const centerX = -transformX * zoomMultiplier + (width * zoomMultiplier) / 2;
        const centerY = -transformY * zoomMultiplier + (height * zoomMultiplier) / 2;
        // 找出最大的节点id
        let maxId = 0
        console.log(nodes)
        nodes.forEach(node => {
            const id =Number(node.id)
            if ( id> maxId) {
                maxId = id
            }
        })
        setOffset(offset => offset+10)
        setNodes(nodes => [...nodes, {id: `${maxId+1}`, data: {}, type: type, position: {x: centerX+offset, y: centerY+offset} }])
    }

    // 删除节点
    const deleteNode = () => {
        setNodes(nodes => nodes.filter(node => node.id != selectedNodeId))
        // 还需要把边连接的点全部删除
        setEdges(edges => edges.filter(edge => edge.source != selectedNodeId && edge.target != selectedNodeId))
    }

    // 删除边
    const deleteEdge = () => {
        setEdges(edges => edges.filter(edge => edge.id != selectedEdgeId))
    }

    // 执行节点
    const executeGraph = () => {
        console.log(JSON.stringify(nodes))
        console.log(JSON.stringify(edges))
        // 判断一下是否需要全局参数
        let baseParam = nodes.filter(node => node.type == 'basic_param')
        // 添加用户输入数据
        if(nodes.find(node => node.type == "tool_get_message")) {
            // @ts-ignore
            baseParam.push({data: {name: "_message", desc: "用户输入"}})
        }
        let global = new Map()
        const execute = serverExecuteFunctionWarp({
            message_callback: message => Toast.success(message),
            get_message: () => global.get('_message')
        })
        if(baseParam.length > 0) {
            Modal.confirm({
                title: '输入执行参数',
                content: baseParam.map(base => <Input style={{marginTop: 5}} onChange={value => global.set(base.data.name, value)} addonBefore={base.data.name} placeholder={base.data.desc} />),
                cancelButtonProps: { theme: 'borderless' },
                okButtonProps: { theme: 'solid' },
                onOk: () => {
                    console.log("global map is", global)
                    executeFunction(global, nodes, edges, execute).then(res => Toast.success('执行成功'))
                }
            });
        } else {
            executeFunction(global, nodes, edges, execute).then(res => Toast.success('执行成功'))
        }
    }

    // 保存节点
    const saveGraph = () => {
        Modal.confirm({
            title: '保存节点',
            content: <>
                <Input onChange={value => setGraph(graph => {graph.name = value;return graph})} defaultValue={graph.name} style={{marginTop: 10}} addonBefore="名称" placeholder={"流程名称(英文/数字)"} />
                <TextArea style={{marginTop: 5}} rows={1} autosize onChange={value => setGraph(graph => {graph.desc = value;return graph})} defaultValue={graph.desc} placeholder={"流程描述信息"} />
            </>,
            cancelButtonProps: { theme: 'borderless' },
            okButtonProps: { theme: 'solid' },
            onOk: () => {
                if(!regex.test(graph.name)) {
                    Toast.error("名称只能为英文/数字")
                    return
                }
                let data = graph
                data.nodes = nodes
                data.edges = edges
                if(data.id) {
                    SaveData(data.id!, graph).then(_=>Toast.success("更新成功"))
                } else {
                    AddData(graph).then(_=>Toast.success("保存成功"))
                }
            }
        });
    }

    useEffect(() => {
        const selectedNode = nodes.filter(node => node.selected)
        setSelectedNodeId(selectedNode.length > 0?selectedNode[0].id:'')
        const selectedEdge = edges.filter(edge => edge.selected)
        setSelectedEdgeId(selectedEdge.length > 0?selectedEdge[0].id:'')
    }, [nodes, edges])

    // 初次启动加载数据
    useEffect(() => {
        const graphId = getUrlParam("id")
        if(graphId != "") {
            GetData<GraphInfo>(graphId).then((graph) => {
                setGraph(graph)
                setNodes(graph.nodes)
                setEdges(graph.edges)
            })
        }
    }, [])

    return (
        <div style={{ width: "100%", height: "100%" }}>
            <ReactFlow
                fitView
                // @ts-ignore
                nodeTypes={nodeTypes}
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                // @ts-ignore
                onConnect={onConnect}
                onMoveEnd={()=>{setOffset(0)}}
            >
                <Controls />
                <MiniMap />
                <Background gap={12} size={1} />
                <Panel position="top-left">
                    <Collapse style={{width: 350}} defaultActiveKey={"1"}>
                        <Collapse.Panel header="基础节点" itemKey="1">
                            <Row gutter={[5, 5]}>
                                <Col span={6}><Button icon={<IconPlay />} block onClick={()=>addNode('basic_start')}>开始</Button></Col>
                                <Col span={6}><Button icon={<IconHelpCircleStroked />} block onClick={()=>addNode('basic_param')}>参数</Button></Col>
                                <Col span={6}><Button icon={<IconSaveStroked />} block onClick={()=>addNode('basic_variable')}>变量</Button></Col>
                                <Col span={6}><Button icon={<IconTrueFalseStroked />} block onClick={()=>addNode('basic_rule_engine')}>规则</Button></Col>
                                <Col span={6}><Button icon={<IconInheritStroked />} block onClick={()=>addNode('basic_switch')}>选择</Button></Col>
                            </Row>
                        </Collapse.Panel>
                        <Collapse.Panel header="网页操作" itemKey="2">
                            <Row gutter={[5, 5]}>
                                <Col span={12}><Button icon={<IconChainStroked />} block onClick={()=>addNode('tool_open_url')}>打开网页</Button></Col>
                                <Col span={12}><Button icon={<IconInteractiveStroked />} block onClick={()=>addNode('tool_click')}>点击操作</Button></Col>
                                <Col span={12}><Button icon={<IconEdit2Stroked />} block onClick={()=>addNode('tool_input')}>输入文本</Button></Col>
                                <Col span={12}><Button icon={<IconTestScoreStroked />} block onClick={()=>addNode('tool_get_text')}>获取文本</Button></Col>
                                <Col span={12}><Button icon={<IconFingerLeftStroked />} block onClick={()=>addNode('tool_get_select')}>获取选中</Button></Col>
                                <Col span={12}><Button icon={<IconFixedStroked />} block onClick={()=>addNode('tool_get_element')}>获取元素</Button></Col>
                                <Col span={12}><Button icon={<IconDeleteStroked />} block onClick={()=>addNode('tool_remove')}>删除元素</Button></Col>
                                <Col span={12}><Button icon={<IconSortStroked />} block onClick={()=>addNode('tool_scroll')}>屏幕滚动</Button></Col>
                            </Row>
                        </Collapse.Panel>
                        <Collapse.Panel header="功能节点" itemKey="3">
                            <Row gutter={[5, 5]}>
                                <Col span={12}><Button icon={<IconMailStroked />} block onClick={()=>addNode('tool_get_message')}>获取消息</Button></Col>
                                <Col span={12}><Button icon={<IconSendStroked />} block onClick={()=>addNode('tool_send_message')}>发送消息</Button></Col>
                                <Col span={12}><Button icon={<IconElementStroked />} block onClick={()=>addNode('tool_call_llm')}>调用模型</Button></Col>
                            </Row>
                        </Collapse.Panel>
                    </Collapse>
                </Panel>
                <Panel position={"top-right"}>
                    <Space>
                        <Button icon={<IconPlay />} onClick={executeGraph}>执行</Button>
                        <Button icon={<IconSave />} type={"secondary"} onClick={saveGraph}>保存</Button>
                        {selectedNodeId!==''?<Button type="danger" onClick={deleteNode}>删除节点</Button>:null}
                        {selectedEdgeId!==''?<Button type="danger" onClick={deleteEdge}>删除连线</Button>:null}
                    </Space>
                </Panel>
            </ReactFlow>
        </div>
    );
}

