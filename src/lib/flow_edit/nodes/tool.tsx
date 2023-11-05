import BaseNode from './base'
import {
    IconBarChartVStroked, IconChainStroked,
    IconDeleteStroked, IconDoubleChevronRight,
    IconEdit2Stroked, IconElementStroked, IconFingerLeftStroked,
    IconFixedStroked,
    IconInteractiveStroked, IconMailStroked, IconSendStroked, IconSortStroked, IconTestScoreStroked,
    IconTextStroked
} from "@douyinfe/semi-icons";
import {Input, InputNumber, TextArea} from "@douyinfe/semi-ui";
import {Node} from 'reactflow';
import {useEffect, useState} from "react";
import Text from "@douyinfe/semi-ui/lib/es/typography/text";

export function ToolClick(data: Node<{ default_position: string }>) {
    return (
        <><BaseNode
            node={data} height={30} width={300}
            inputs={[
                {id: "tool_click_position", desc: <><IconFixedStroked />元素位置</>},
            ]}
            outputs={[]}
            name={"点击元素"} icon={<IconInteractiveStroked />}>
            <Input onChange={value => data.data.default_position = value} defaultValue={data.data.default_position} addonBefore="元素位置" placeholder={"默认值"} />
        </BaseNode></>
    );
}

export function ToolInput(data: Node<{ default_position: string, default_text: string }>) {
    return (
        <><BaseNode
            node={data} height={60} width={300}
            inputs={[
                {id: "tool_input_position", desc: <><IconFixedStroked />输入框位置</>},
                {id: "tool_input_text", desc: <><IconTextStroked />文本</>},
            ]}
            outputs={[]}
            name={"输入文本"} icon={<IconEdit2Stroked />}>
            <Input onChange={value => data.data.default_position = value} defaultValue={data.data.default_position} addonBefore="元素位置" placeholder={"默认值"} />
            <Input onChange={value => data.data.default_text = value} defaultValue={data.data.default_text} addonBefore="文本内容" placeholder={"默认值"} />
        </BaseNode></>
    );
}

export function ToolRemove(data: Node<{default_position: string}>) {
    return (
        <><BaseNode
            node={data} height={30} width={300}
            inputs={[
                {id: "tool_remove_position", desc: <><IconFixedStroked />元素位置</>},
            ]}
            outputs={[]}
            name={"删除元素"} icon={<IconDeleteStroked />}>
            <Input onChange={value => data.data.default_position = value} defaultValue={data.data.default_position} addonBefore="元素位置" placeholder={"默认值"} />
        </BaseNode></>
    );
}

export function ToolScroll(data: Node<{default_scroll_val: number}>) {
    return (
        <><BaseNode
            node={data} height={40} width={300}
            inputs={[
                {id: "tool_scroll_value", desc: <><IconBarChartVStroked />滚动值</>},
            ]}
            outputs={[]}
            name={"滚动屏幕"} icon={<IconSortStroked />}>
            <InputNumber prefix={"滚动值"} placeholder={"默认值(正向下，负向上)"} defaultValue={data.data.default_scroll_val} onNumberChange={value => data.data.default_scroll_val = value} hideButtons  />
        </BaseNode></>
    );
}

export function ToolGetText(data: Node<{default_position: string}>) {
    return (
        <><BaseNode
            node={data} height={40} width={300}
            inputs={[
                {id: "tool_get_text_position", desc: <><IconFixedStroked />元素位置</>},
            ]}
            outputs={[
                {id: "tool_get_text_value", desc: <><IconTextStroked />文本值</>},
            ]}
            name={"获取文本"} icon={<IconTestScoreStroked />}>
            <Input onChange={value => data.data.default_position = value} defaultValue={data.data.default_position} addonBefore="元素位置" placeholder={"默认值"} />
        </BaseNode></>
    );
}

export function ToolGetSelect(data: Node<object>) {
    return (
        <><BaseNode
            node={data} height={20}
            inputs={[]}
            outputs={[{id: "tool_get_select_content", desc: <><IconTextStroked />文本</>}]}
            name={"获取选中"} icon={<IconFingerLeftStroked />}>
            <Text>获取用户在网页上选中的文本</Text>
        </BaseNode></>
    );
}

export function ToolGetElement(data: Node<object>) {
    return (
        <><BaseNode
            node={data} height={30}
            inputs={[]}
            outputs={[{id: "tool_get_element_position", desc: <><IconFixedStroked />元素位置</>}]}
            name={"获取元素"} icon={<IconFixedStroked />}>
            <Text>让用户在网页上右键选择元素<br />并返回元素位置</Text>
        </BaseNode></>
    );
}

export function ToolOpenUrl(data: Node<{default_url: string}>) {
    return (
        <><BaseNode
            node={data} height={30} width={300}
            inputs={[
                {id: "tool_open_url_value", desc: <><IconTextStroked />链接</>},
            ]}
            outputs={[]}
            name={"打开网页"} icon={<IconChainStroked />}>
            <Input onChange={value => data.data.default_url = value} defaultValue={data.data.default_url} addonBefore="链接" placeholder={"默认值"} />
        </BaseNode></>
    );
}

export function ToolGetMessage(data: Node<object>) {
    return (
        <><BaseNode node={data} height={20}
                    inputs={[]}
                    outputs={[{id: "tool_get_message_content", desc: <><IconTextStroked />消息</>}]}
                    name={"获取用户输入"} icon={<IconMailStroked />}>
            <Text>获取用户发送的消息</Text>
        </BaseNode></>
    );
}

export function ToolSendMessage(data: Node<{default_message: string}>) {
    return (
        <><BaseNode node={data} height={30} width={300}
                    inputs={[
                        {id: "tool_send_message_content", desc: <><IconTextStroked />消息</>},
                    ]}
                    outputs={[]}
                    name={"发送消息"} icon={<IconSendStroked />}>
            <Input onChange={value => data.data.default_message = value} defaultValue={data.data.default_message} addonBefore="消息" placeholder={"默认消息"} />
        </BaseNode></>
    );
}


export function ToolCallLlm(data: Node<{params_num: number, prompt: string}>) {
    const [variableNum, setVariableNum] = useState(data.data.params_num)
    const [inputInfo, setInputInfo] = useState([
        {id: "tool_call_llm_arg_1", desc: <><IconDoubleChevronRight />变量1输入</>}
    ])

    const setUi = () => {
        const inputs = []
        for (let i = 0; i < variableNum; i++) {
            inputs.push({id: `tool_call_llm_arg_${i+1}`, desc: <><IconDoubleChevronRight />{`变量${i+1}输入`}</>})
        }
        setInputInfo(inputs)
    }

    // 默认启动设置变量
    useEffect(() => {
        if(data.data.params_num) {
            setUi()
        }
    }, [])

    useEffect(() => {
        data.data.params_num = variableNum
        setUi()
    }, [variableNum])

    return (
        <><BaseNode
            node={data} height={150} width={300}
            inputs={inputInfo}
            outputs={[
                {id: "tool_call_llm_out", desc: <><IconTestScoreStroked />输出</>}
            ]}
            name={"调用大语言模型"} icon={<IconElementStroked />}>
            <InputNumber prefix={"变量数"} onNumberChange={setVariableNum} hideButtons defaultValue={variableNum} max={10} min={1} />
            <TextArea style={{marginTop: 10}} rows={5} onChange={value => data.data.prompt = value} defaultValue={data.data.prompt} placeholder={"prompt信息，参数1:{arg1}"} />
        </BaseNode></>
    );
}
