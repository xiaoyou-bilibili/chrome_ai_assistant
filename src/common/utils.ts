export const getUrlParam = (key: string): string =>  {
    const params = window.location.search.substring(1).split('&')
    const paramValue = params.find(param => param.startsWith(`${key}=`))
    if (paramValue) {
        return paramValue.split('=')[1]
    }
    return ""
}

export function getSelector(el: Element) {
    if (el.id) {
        // 如果元素有id，返回id选择器
        return '#' + el.id;
    } else if (el.className) {
        // 如果元素有类名，返回类名选择器
        return '.' + el.className.split(' ').join('.');
    } else {
        // 否则返回元素标签名
        return el.tagName;
    }
}