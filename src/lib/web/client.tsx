import {FunctionType, HandleFunction} from "../../common/type";
import {generateRandomString, getSelector} from "../../common/utils";
import {Modal, Notification, Toast, ToastFactory, Typography} from '@douyinfe/semi-ui';
import {ElementPicker} from '../tool/element-picker'
import {useState} from "react";
import {randomUUID} from "crypto";
import {it} from "node:test";

const { Text } = Typography;


const functionMap = new Map<FunctionType, any>([
    [FunctionType.Input, async (data: { id: string, text: string }): Promise<string> => {
        let dom = document.querySelector<HTMLElement>(data.id)
        console.log("target is", dom)
        if(dom) {
            let evt = new InputEvent('input', {inputType: 'insertText'})
            // @ts-ignore
            dom.value = data.text
            dom.dispatchEvent(evt)
        }
        return ""
    }],
    [FunctionType.Click, async (data: {id: string}): Promise<string> => {
        let dom =document.querySelector<HTMLElement>(data.id)
        console.log("target is", dom)
        dom?.click()
        return ""
    }],
    [FunctionType.GetText, async (data: {id: string}): Promise<string> => {
        console.log("获取文本", data)
        return  data.id? "": document.body.innerText
    }],
    [FunctionType.GetSelect, async (data: {}): Promise<string> => {
        return window.getSelection()?.toString() || ""
    }],
    [FunctionType.GetElement, (data: {hint: string, tag: string}): Promise<string> => {
        return new Promise((resolve, reject) => {
            let oldElement:HTMLElement
            const tags = data.tag.split(",").map(item=>item.toLowerCase())
            const toast =  ToastFactory.create({left: 2, duration: 0}), id = generateRandomString(4)
            toast.info({ content: data.hint, id })
            new ElementPicker((ele)=>{
                toast.close(id)
                let position = getSelector(oldElement)
                resolve(position)
            }, (ele)=>{
                if(oldElement != ele) {
                    oldElement = ele
                    if(tags.includes(ele.tagName.toLowerCase())) {
                        toast.success({content: '已定位到对应元素请按右键确认', id})
                    } else {
                        toast.info({ content: data.hint, id })
                    }
                }
                console.log(ele.tagName.toLowerCase())
            })
        })
    }],
    [FunctionType.Remove, async (data: {id: string}): Promise<string> => {
        document.querySelector(data.id)?.remove()
        return ""
    }],
    [FunctionType.Confirm, (data: {hint: string}): Promise<string> => {
        return new Promise((resolve, reject) => {
            Modal.confirm({content: data.hint, title: '提示', onOk:()=> resolve('true'), onCancel: ()=>resolve('false')})
        })
    }],
    [FunctionType.ToastSuccess, async (data: {content: string}): Promise<string> => {
        Toast.success(data.content)
        return ""
    }],
])

export async function webExecuteFunction (info: HandleFunction): Promise<string> {
    if(functionMap.has(info.function_type)) {
        return functionMap.get(info.function_type)!(info.param)
    } else {
        console.log("未找到处理函数", info)
    }
    return ""
}