import {Tabs, TabPane, Form, Button, Toast, Table, Space} from "@douyinfe/semi-ui";
import type { BaseFormApi } from '@douyinfe/semi-foundation/lib/es/form/interface';
import React, {useEffect, useState} from "react";
import {StorageKeyConfig} from "../../common/const"
import "./options.css"
import {DeleteData, GetAllData} from "../../common/db";
import {GraphInfo} from "../../common/type";
import {IconDelete, IconEdit, IconPlus} from "@douyinfe/semi-icons";

export default function Options() {
    const [fromApi, setFromApi] = useState<BaseFormApi>()
    const [graphList, setGraphList] = useState<GraphInfo[]>([])
    
    useEffect(() => {
        chrome.storage.sync.get([StorageKeyConfig]).then(value => {
            fromApi?.setValues(value.config)
        })
    }, [fromApi])

    useEffect(() => {
        getGraph()
    }, [])
    
    const save_config = () => {
        chrome.storage.sync.set({config: fromApi?.getValues()}).then(() => {Toast.info("设置成功")})
    }

    const getGraph = () => GetAllData<GraphInfo>().then(setGraphList)
    const deleteGraph = (id: string) => DeleteData(id).then(_=>{Toast.success("删除成功");getGraph()})
    const editGraph = (id: string) =>  chrome.windows.create({url: `edit.html?id=${id}`, type: 'panel', width: 1200, height: 900}, function(window) {
        // 窗口创建成功后的回调函数
        console.log('新窗口已创建，窗口消息为：', window);
    });

    return (
        <Tabs type="line" className={"container"} onChange={()=>getGraph()}>
            <TabPane tab="插件设置" itemKey="1">
                <Form getFormApi={api => setFromApi(api)}>
                    <Form.Input labelPosition={"left"} field={"base"} label={"openai 域名"}/>
                    <Form.Input labelPosition={"left"} field={"key"} label={"openai 秘钥"}/>
                    <Button type="primary" onClick={save_config}>保存</Button>
                </Form>
            </TabPane>
            <TabPane tab="技能库" itemKey="2">
                <Space><Button icon={<IconPlus />} onClick={()=>editGraph('')}>新增技能</Button> </Space>
                <Table dataSource={graphList} columns={[
                    {title: 'id', dataIndex: 'id'},
                    {title: '名称', dataIndex: 'name'},
                    {title: '描述', dataIndex: 'desc'},
                    {title: '编辑', render: (item) => <Space>
                            <Button icon={<IconEdit />} onClick={()=>editGraph(item.id)} />
                            <Button icon={<IconDelete />} type={"danger"} onClick={()=>deleteGraph(item.id)} />
                    </Space> },
                ]} pagination={true} />
            </TabPane>
        </Tabs>
    )
}