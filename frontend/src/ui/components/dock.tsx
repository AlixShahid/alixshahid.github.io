import { useTerminalOpen, useTerminalToggle } from '$exporter/hook'

import './dock.css'

export default function Dock() {
    const isOpen = useTerminalOpen()
    const toggle = useTerminalToggle()
    return (
        <div className={`dock dock-btn ${isOpen ? 'active' : ''}`} onClick={(e: Event) => { e.stopPropagation(); toggle() }} data-h>
            <svg viewBox="0 0 24 24">
                <rect x="2" y="3" width="20" height="18" rx="3" ry="3" />
                <polyline points="7 9 11 12 7 15" />
                <line x1="13" y1="15" x2="17" y2="15" />
            </svg>
            <div className="dock-tip">terminal</div>
        </div>

    )
}
