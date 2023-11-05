import remarkGfm from "remark-gfm";
import {Prism as SyntaxHighlighter} from "react-syntax-highlighter";
import {vs} from "react-syntax-highlighter/dist/esm/styles/prism";
import Markdown from "react-markdown";
import {Message} from "@chatscope/chat-ui-kit-react";

interface CustomMarkDownProps {
    content: string
}

export function CustomMarkDown(props: CustomMarkDownProps) {
    return <Markdown remarkPlugins={[remarkGfm]}  components={{
        code(props) {
            const {children, className, ...rest} = props
            const match = /language-(\w+)/.exec(className || '')
            // @ts-ignore
            return match ? <SyntaxHighlighter
                    {...rest}
                    children={String(children).replace(/\n$/, '')}
                    style={vs}
                    language={match[1]}
                    PreTag="div"
                /> : <code {...rest} className={className}>{children}</code>
        }
    }}>{props.content}</Markdown>
}

export function MarkDownMessage(props: CustomMarkDownProps) {
    return <Message model={{direction: "incoming", type: "custom", position: "single"}} >
        <Message.CustomContent><div style={{textAlign: "left"}}><CustomMarkDown content={props.content}/></div></Message.CustomContent>
    </Message>
}