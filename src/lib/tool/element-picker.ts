type htmlHandle = (e: HTMLElement)=>void

const emptyHandle = (e: HTMLElement) => {}

export class ElementPicker {
    private oldTarget: HTMLElement|null = null
    private oldBackgroundColor: string = ''
    private desiredBackgroundColor = 'rgba(0, 0, 0, 0.1)'
    private readonly onClick: htmlHandle
    private readonly onMove: htmlHandle

    constructor(onClick:htmlHandle=emptyHandle, onMove: htmlHandle=emptyHandle) {
        if (typeof window === 'undefined' || !window.document) {
            console.error('elementPicker requires the window and document.')
        }
        this.onClick = onClick
        this.onMove = onMove
        document.addEventListener('contextmenu', this.onMouseClick, false)
        document.addEventListener('mousemove', this.onMouseMove, false)

    }


    private onMouseClick = (event: MouseEvent) => {
        const target = event.target as HTMLElement
        event.preventDefault()
        event.stopPropagation()
        this.onClick(target)
        this.reset()
        return false
    }

    private onMouseMove = (event: MouseEvent) => {
        const target = event.target as HTMLElement
        if (this.oldTarget) {
            this.resetOldTargetColor()
        } else {
            document.body.style.cursor = 'pointer'
        }
        this.oldTarget = target
        this.oldBackgroundColor = target.style.backgroundColor
        target.style.backgroundColor = this.desiredBackgroundColor
        this.onMove(target)
    }

    private reset() {
        document.removeEventListener('contextmenu', this.onMouseClick, false)
        document.removeEventListener('mousemove', this.onMouseMove, false)
        document.body.style.cursor = 'auto'
        if (this.oldTarget) {
            this.resetOldTargetColor()
        }
        this.oldTarget = null
        this.oldBackgroundColor = ''
    }

    private resetOldTargetColor() {
        this.oldTarget!.style.backgroundColor = this.oldBackgroundColor
    }

}


