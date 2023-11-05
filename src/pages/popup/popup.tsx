import './popup.css'
import {Button, Row, Col, Divider, Space, Modal} from "@douyinfe/semi-ui";
import {
    IconComment,
    IconGithubLogo,
    IconPlayCircle,
    IconPlusCircle,
    IconSetting,
    IconYoutube
} from "@douyinfe/semi-icons";
import React, {useState} from "react";

function Popup() {
    const openLink = (url: string) => window.open(url)


    const openOption = () => chrome.runtime.openOptionsPage()

    const startWindow = () => chrome.windows.create({url: 'chat.html', type: 'panel', width: 400, height: 700 }, function(w) {
        window.close()
    });

    const addSkill = () => chrome.windows.create({url: `edit.html?id=89505c94-01d1-47a8-a2ed-1ac1cdcd4558`, type: 'panel', width: 1200, height: 900}, function(w) {
        window.close()
    })

    return (
        <div className="container">
            <Row gutter={[10, 10]} justify={"center"}>
                <Col span={24}><Button block icon={<IconComment />} onClick={startWindow}>启动助手</Button></Col>
                <Col span={24}><Button block icon={<IconPlusCircle />} onClick={addSkill}>新增技能</Button></Col>
                <Col span={24}><Button block icon={<IconSetting />} onClick={openOption}>助手设置</Button></Col>
                <Divider>关于作者</Divider>
                <Col span={24}>
                    <Space>
                        <Button theme='borderless' type='secondary' icon={<IconPlayCircle />} onClick={()=>openLink("https://space.bilibili.com/343147393")}>B站</Button>
                        <Button theme='borderless' type='danger' icon={<IconYoutube />} onClick={()=>openLink("https://www.youtube.com/channel/UCdHNS1d3fTx-m69tKsr7n3w")}>YouTube</Button>
                        <Button theme='borderless' type='tertiary' icon={<IconGithubLogo />} onClick={()=>openLink("https://github.com/xiaoyou-bilibili")}>github</Button>
                    </Space>
                </Col>
            </Row>
        </div>
      )
}

export default Popup


