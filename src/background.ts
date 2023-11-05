console.log('background')
chrome.runtime.onMessage.addListener((msg) => {
    console.log("收到消息", msg)
})
// chrome.browserAction.onClicked.addListener(function (tab) {
//     console.log("执行页面")
//     chrome.tabs.executeScript({
//         file: 'lib/jquery-3.7.1.js'
//     });
// })
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    // 检查网页是否完全加载完成
    if (changeInfo.status === 'complete') {
        console.log("执行脚本")
        // 执行您的脚本
    }
});
