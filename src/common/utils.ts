export const getUrlParam = (key: string): string =>  {
    const params = window.location.search.substring(1).split('&')
    const paramValue = params.find(param => param.startsWith(`${key}=`))
    if (paramValue) {
        return paramValue.split('=')[1]
    }
    return ""
}

export function getSelector(el: Element | null): string {
    if (!el || ["document", "BODY", "HTML"].includes(el.tagName)) {
        return ""
    }
    let tag = el.tagName
    if (el.id) {
        // 如果元素有id，返回id选择器
        tag = '#' + el.id;
    } else if (el.className) {
        // 如果元素有类名，返回类名选择器
        tag = '.' + el.className.split(' ').join('.');
    }

    return `${getSelector(el.parentElement)} ${tag}`.trim()
}

export function generateRandomString(length: number) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const charactersLength = characters.length;

    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
}

export const exportJson = (data: any, name:string) => {
    let link = document.createElement('a')
    link.download = `${name}.json`
    link.href = 'data:text/plain,' + JSON.stringify(data)
    link.click()
}