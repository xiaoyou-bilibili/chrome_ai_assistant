import {FunctionType, HandleFunction} from "../../common/type";
import {getSelector} from "../../common/utils";
import {Modal, Notification} from '@douyinfe/semi-ui';
// @ts-ignore
import  elementsPicker from "element-picker"

const functionMap = new Map<FunctionType, any>([
    [FunctionType.Input, async (data: { id: string, text: string }): Promise<string> => {
        let dom = document.querySelector(data.id)
        let evt = new InputEvent('input', {inputType: 'insertText'})
        // @ts-ignore
        dom.value = data.text; dom.dispatchEvent(evt)
        return ""
    }],
    [FunctionType.Click, async (data: {id: string}): Promise<string> => {
        // @ts-ignore
        document.querySelector(data.id)?.click()
        return ""
    }],
    [FunctionType.GetText, async (data: {id: string}): Promise<string> => {
        console.log("获取文本", data)
        return  data.id? "": document.body.innerText
    }],
    [FunctionType.GetSelect, async (data: {}): Promise<string> => {
        return window.getSelection()?.toString() || ""
    }],
    [FunctionType.GetElement, (data: {hint: string}): Promise<string> => {
        return new Promise((resolve, reject) => {
            const id = Notification.info({content: data.hint, title: '选择元素并单击', duration: 0, position: 'top', showClose: false})
            elementsPicker.init({onClick: (ele: Element)=>{
                Notification.close(id)
                let position = getSelector(ele)
                console.log("element position", ele, position)
                resolve(position)
            }})
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
])

export async function webExecuteFunction (info: HandleFunction): Promise<string> {
    if(functionMap.has(info.function_type)) {
        return functionMap.get(info.function_type)!(info.param)
    } else {
        console.log("未找到处理函数", info)
    }
    return ""
}