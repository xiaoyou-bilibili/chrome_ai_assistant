import {Handle, Node, Position} from 'reactflow';
import {Card, Divider} from "@douyinfe/semi-ui";
import { Col, Row } from '@douyinfe/semi-ui';
import {ReactNode, useEffect, useState} from "react";
import {IconChevronRight} from "@douyinfe/semi-icons";

export interface HandleInfo {
    id: string
    desc: string | ReactNode
}

interface BaseNodeParam {
    children: ReactNode
    height: number
    width?: number
    node: Node
    inputs: HandleInfo[]
    outputs: HandleInfo[]
    name: string
    icon: ReactNode
    noStart?: boolean
    noEnd?: boolean
}

export default function BaseNode(props: BaseNodeParam) {
    const {inputs, outputs, height, noStart, noEnd} =  props
    const defaultElementHeight = noStart&&noEnd?72:92
    const [elements, setElements] = useState<ReactNode[]>([])
    const [handles, setHandles] = useState<ReactNode[]>([])

    useEffect(() => {
        const els = [
            <Col key={`start}`} span={12}><div style={{display: "flex", justifyContent: "start", alignItems: "center", height: 20}}>{noStart?"":<IconChevronRight />}</div></Col>,
            <Col key={`end`} span={12}><div style={{display: "flex", justifyContent: "end", alignItems: "center", height: 20}}>{noEnd?"":<IconChevronRight />}</div></Col>
        ]
        const hds = []
        if(noStart && noEnd) {
            els.splice(0)
        }
        if(!noStart) {
            hds.push(<Handle key={'in'} type="target" position={Position.Left} id={"base_before"} style={{top: height+defaultElementHeight-20}} />)
        }
        if(!noEnd) {
            hds.push(<Handle key={'out'} type="source" position={Position.Right} id={"base_after"} style={{top: height+defaultElementHeight-20}} />)
        }
        for (let i = 0; i < Math.max(inputs.length, outputs.length); i++) {
            els.push(<Col key={`start_${i}`} span={12}><div style={{display: "flex", justifyContent: "start", alignItems: "center", height: 20}}>{i < inputs.length? inputs[i].desc: ''}</div></Col>)
            els.push(<Col key={`end_${i}`} span={12}><div style={{display: "flex", justifyContent: "end", alignItems: "center", height: 20}}>{i < outputs.length? outputs[i].desc: ''}</div></Col>)
        }
        for (let i = 0; i < inputs.length; i++) {
            hds.push(<Handle key={inputs[i].id} type="target" position={Position.Left} id={inputs[i].id} style={{top: height+defaultElementHeight+20*i}} />)
        }
        for (let i = 0; i < outputs.length; i++) {
            hds.push(<Handle key={outputs[i].id} type="source" position={Position.Right} id={outputs[i].id} style={{top: height+defaultElementHeight+20*i}} />)
        }
        setElements(els)
        setHandles(hds)
    }, [inputs, outputs])

    return (
        <>
            <Card className={"react-flow__node-base"} shadows={props.node.selected?"always":"hover"} style={{minWidth: 200, width: props.width}}>
                <Divider style={{marginTop: -10, marginBottom: 10}} align='left'> {props.icon} <span style={{width: 5}}></span>{`[${props.node.id}]`} {props.name}</Divider>
                <div style={{height: props.height}}>{props.children}</div>
                <Divider style={{marginTop: 10, marginBottom: 10}}></Divider>
                <Row type="flex" justify="space-between" style={{marginLeft: -12, marginRight: -12}}>
                    {elements}
                </Row>
                <div style={{marginBottom: -10}}>
                    {handles}
                </div>
            </Card>
        </>
    );
}