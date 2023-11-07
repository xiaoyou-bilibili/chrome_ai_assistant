import React from "react";
import {HandleFunction} from "../common/type";
import {webExecuteFunction} from "../lib/web/client";

function App() {
    chrome.runtime.onMessage.addListener(function(info: HandleFunction, sender, sendResponse) {
        console.log("收到消息", info)
        webExecuteFunction(info).then(sendResponse)
        return true
    });

    return (
        <></>
    )
}

export default App