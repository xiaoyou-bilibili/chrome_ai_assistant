import BaseNode, {HandleInfo} from './base'
import {Input, InputGroup, InputNumber} from "@douyinfe/semi-ui";
import {
    IconChevronRight, IconDoubleChevronRight,
    IconHelpCircleStroked, IconInheritStroked,
    IconPlay,
    IconSaveStroked,
    IconTextStroked, IconTrueFalseStroked, IconVoteVideoStroked
} from "@douyinfe/semi-icons";
import Text from "@douyinfe/semi-ui/lib/es/typography/text";
import {ReactNode, useEffect, useState} from "react";
import {Node} from 'reactflow';
export function BasicStart(data: Node<object>) {
    return (
        <><BaseNode node={data} noStart height={20} inputs={[]} outputs={[]} name={"开始节点"}  icon={<IconPlay />}>
            <Text>流程的开始</Text>
        </BaseNode></>
    );
}

export function BasicParam(data: Node<{name: string, desc: string}>) {
    return (
        <><BaseNode node={data} noStart noEnd height={60} width={300} inputs={[]} outputs={[{id: "basic_param_val", desc: <>参数输出<IconDoubleChevronRight /></>}]} name={"参数"}  icon={<IconHelpCircleStroked />}>
            <Input onChange={value => data.data.name = value} defaultValue={data.data.name} addonBefore={"参数名称"} />
            <Input onChange={value => data.data.desc = value} defaultValue={data.data.desc} addonBefore={"参数描述"} />
        </BaseNode></>
    );
}

export function BasicVariable(data: Node<{variables: string[]}>) {
    const [variableNum, setVariableNum] = useState(data.data.variables?.length||1)
    const [height, setHeight] = useState(70)
    const [inputInfo, setInputInfo] = useState<HandleInfo[]>([])
    const [outputInfo, setOutputInfo] = useState<HandleInfo[]>([])
    const [editInfo, setEditInfo] = useState<ReactNode[]>([])

    const setUi = () => {
        const inputs = [], outputs = [], edits = []
        for (let i = 1; i <= variableNum; i++) {
            inputs.push({id: `basic_variable_${i}_in`, desc: <><IconDoubleChevronRight />{`变量${i}输入`}</>})
            outputs.push({id: `basic_variable_${i}_out`, desc: <>{`变量${i}输出`}<IconDoubleChevronRight /></>})
            edits.push(<Input key={i} style={{marginTop: 5}} defaultValue={data.data.variables[i-1]} onChange={value => data.data.variables[i-1] = value} addonBefore={`变量${i}`} placeholder={"默认值"} />)
        }
        setInputInfo(inputs)
        setOutputInfo(outputs)
        setEditInfo(edits)
        setHeight(20+40*variableNum)
    }

    // 默认启动设置变量
    useEffect(() => {
        if((data.data.variables?.length||0) < variableNum) {
            if(!data.data.variables) data.data.variables = []
            data.data.variables = [...data.data.variables, ...Array.from({ length: variableNum-data.data.variables.length }, () => '')]
        } else if (data.data.variables.length > variableNum) {
            data.data.variables = data.data.variables.splice(variableNum)
        }
        setUi()
    }, [variableNum])


    return (
        <><BaseNode node={data} height={height} width={250}
                    inputs={inputInfo}
                    outputs={outputInfo}
                    name={"变量"} icon={<IconSaveStroked />}>
            <InputNumber prefix={"变量数"} onNumberChange={setVariableNum} hideButtons defaultValue={variableNum} max={10} min={1} />
            {editInfo}
        </BaseNode></>
    );
}

export function BasicRuleEngine(data: Node<{rules:{rule:string, out:string}[]}>) {
    const [variableNum, setVariableNum] = useState(1)
    const [height, setHeight] = useState(70)
    const [editInfo, setEditInfo] = useState([
        <InputGroup style={{marginTop: 5}}>
            <Input placeholder="规则表达式" style={{ width: 150 }} />
            <Input placeholder="输出" style={{ width: 100 }} />
        </InputGroup>
    ])

    const editEvent = (idx: number, val: string, isRule: boolean=true) => {
        if(isRule) {
            data.data.rules[idx].rule = val
        } else {
            data.data.rules[idx].out = val
        }
    }

    useEffect(() => {
        const edits = [], rules = []
        for (let i = 0; i < variableNum; i++) {
            edits.push(<InputGroup style={{marginTop: 5}}>
                <Input onChange={value => editEvent(i, value)} placeholder="规则表达式" style={{ width: 150 }} />
                <Input onChange={value => editEvent(i, value, false)} placeholder="输出" style={{ width: 100 }} />
            </InputGroup>)
            rules.push({rule: '', out: ''})
        }
        setEditInfo(edits)
        setHeight(20+40*variableNum)
        data.data.rules = rules
    }, [variableNum])

    return (
        <><BaseNode node={data} height={height} width={300}
                    inputs={[{id: "basic_rule_engine_in", desc: <><IconDoubleChevronRight />引擎参数</>}]}
                    outputs={[{id: "basic_rule_engine_out", desc: <>引擎输出<IconDoubleChevronRight /></>}]}
                    name={"规则引擎"} icon={<IconTrueFalseStroked />}>
            <InputNumber prefix={"规则数"} onNumberChange={setVariableNum} hideButtons defaultValue={variableNum} max={10} min={1} />
            {editInfo}
        </BaseNode></>
    );
}

export function BasicSwitch(data: Node<{switch_info: string[]}>) {
    const [switchNum, setSwitchNum] = useState(data.data.switch_info?.length||1)
    const [height, setHeight] = useState(30+switchNum*30)
    const [outputInput, setOutputInput] = useState<ReactNode>([])

    const buildOutput = (num: number):HandleInfo[] => {
        return  Array.from({ length: num }, (_,i) => ({id: `basic_switch_after_${i+1}`, desc: <><IconChevronRight />{`分支${i+1}`}</>}))
    }

    // 默认启动设置变量
    useEffect(() => {
        if((data.data.switch_info?.length||0) < switchNum) {
            if(!data.data.switch_info) data.data.switch_info = []
            data.data.switch_info = [...data.data.switch_info, ...Array.from({ length: switchNum-data.data.switch_info.length }, () => '')]
        } else if (data.data.switch_info.length > switchNum) {
            data.data.switch_info = data.data.switch_info.splice(switchNum)
        }
        setOutputInput(Array.from({length: switchNum}, (_, i) =>
            <Input key={i}
                   defaultValue={data.data.switch_info[i]}
                   onChange={value => data.data.switch_info[i] = value}
                   addonBefore={`分支${i+1}`} placeholder="输入等于" style={{width: 243}}
            />
        ))
        setHeight(30+switchNum*30)
    }, [switchNum])

    return (
        <><BaseNode
            node={data} height={height} width={300} noEnd
            inputs={[
                {id: "basic_switch_input", desc: <><IconTextStroked /> 输入</>},
            ]}
            outputs={[
                ...buildOutput(switchNum),
                {id: "basic_switch_after_default", desc: <><IconChevronRight />无命中</>}
            ]}
            name={"选择节点"} icon={<IconInheritStroked />}>
            <InputNumber prefix={"分支数"} onNumberChange={setSwitchNum} hideButtons defaultValue={switchNum} max={10} min={1} />
            {outputInput}
        </BaseNode></>
    );
}

export function BasicMemory(data: Node<{name: string, desc: string, hint: string}>) {
    return (
        <><BaseNode node={data} height={60} width={300}
                    inputs={[{id: "basic_memory_in", desc: <><IconDoubleChevronRight />默认</>}]}
                    outputs={[{id: "basic_memory_out", desc: <>输出<IconDoubleChevronRight /></>}]}
                    name={"记忆"}  icon={<IconVoteVideoStroked />}>
            <Input onChange={value => data.data.name = value} defaultValue={data.data.name} addonBefore={"参数名称"} />
            <Input onChange={value => data.data.desc = value} defaultValue={data.data.desc} addonBefore={"参数描述"} />
        </BaseNode></>
    );
}
