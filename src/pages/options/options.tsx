import {Tabs, TabPane, Form, Button, Toast, Table, Space, Upload} from "@douyinfe/semi-ui";
import type { BaseFormApi } from '@douyinfe/semi-foundation/lib/es/form/interface';
import React, {useEffect, useState} from "react";
import {StorageKeyConfig} from "../../common/const"
import "./options.css"
import {AddData, DeleteData, GetAllData} from "../../common/db";
import {GraphInfo} from "../../common/type";
import {IconDelete, IconEdit, IconExport, IconImport, IconPlus} from "@douyinfe/semi-icons";
import {exportJson} from "../../common/utils";
import {BeforeUploadProps} from "@douyinfe/semi-ui/lib/es/upload";
import {shouldProcessLinkClick} from "react-router-dom/dist/dom";

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

    const getGraph = () => {GetAllData<GraphInfo>().then(setGraphList)}
    const showInfoAndUpdate = (msg: string) => ()=>{Toast.success(msg);getGraph()}
    const deleteGraph = (id: string) => DeleteData(id).then(showInfoAndUpdate("删除成功"))
    const editGraph = (id: string) =>  chrome.windows.create({url: `edit.html?id=${id}`, type: 'panel', width: 1200, height: 900}, function(window) {
        // 窗口创建成功后的回调函数
        console.log('新窗口已创建，窗口消息为：', window);
    });

    const uploadFileEvent = (e: BeforeUploadProps): boolean => {
        if(e.file.fileInstance) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const jsonData = JSON.parse(e.target?.result as string || "{}");
                AddData(jsonData).then(showInfoAndUpdate("导入成功"))
            };
            reader.readAsText(e.file.fileInstance);
        }
        return false
    }

    return (
        <Tabs type="line" className={"container"} onChange={getGraph}>
            <TabPane tab="插件设置" itemKey="1">
                <Form getFormApi={api => setFromApi(api)}>
                    <Form.Input labelPosition={"left"} field={"base"} label={"openai 域名"}/>
                    <Form.Input labelPosition={"left"} field={"key"} label={"openai 秘钥"}/>
                    <Button type="primary" onClick={save_config}>保存</Button>
                </Form>
            </TabPane>
            <TabPane tab="技能库" itemKey="2">
                <Space>
                    <Button icon={<IconPlus />} onClick={()=>editGraph('')}>新增技能</Button>
                    <Upload accept="application/json" showUploadList={false} beforeUpload={uploadFileEvent}>
                        <Button icon={<IconImport />} type={"secondary"}>导入技能</Button>
                    </Upload>
                </Space>
                <Table dataSource={graphList} columns={[
                    {title: 'id', dataIndex: 'id'},
                    {title: '名称', dataIndex: 'name'},
                    {title: '描述', dataIndex: 'desc'},
                    {title: '编辑', render: (item) => <Space>
                            <Button icon={<IconEdit />} onClick={()=>editGraph(item.id)} />
                            <Button icon={<IconDelete />} type={"danger"} onClick={()=>deleteGraph(item.id)} />
                            <Button icon={<IconExport />} type={"secondary"} onClick={()=>exportJson(item, item.id)} />
                    </Space> },
                ]} pagination={true} />
            </TabPane>
        </Tabs>
    )
}