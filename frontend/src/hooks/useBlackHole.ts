export interface BlackHoleState {
    restX: number
    restY: number
    curX: number
    curY: number
    intensity: number
    targetIntensity: number
    hovering: boolean
    hoverStart: number
    countdown: number
    sucked: boolean
    suckPhase: number
    suckTimer: number
    scenePullX: number
    scenePullY: number
    sceneScale: number
    canvasDriftX: number
    canvasDriftY: number
    cursorAttrX: number
    cursorAttrY: number
}

function calcRestPos(): { x: number; y: number } {
    return { x: window.innerWidth - 80, y: 80 }
}

const rest = calcRestPos()

export const bh: BlackHoleState = {
    restX: rest.x,
    restY: rest.y,
    curX: rest.x,
    curY: rest.y,
    intensity: 0,
    targetIntensity: 0,
    hovering: false,
    hoverStart: 0,
    countdown: 10,
    sucked: false,
    suckPhase: 0,
    suckTimer: 0,
    scenePullX: 0,
    scenePullY: 0,
    sceneScale: 1,
    canvasDriftX: 0,
    canvasDriftY: 0,
    cursorAttrX: 0,
    cursorAttrY: 0,
}

export function recalcBlackHoleRest() {
    const pos = calcRestPos()
    bh.restX = pos.x
    bh.restY = pos.y
}

export function startBlackHoleHover() {
    if (bh.sucked) return
    bh.hovering = true
    bh.hoverStart = Date.now()
    bh.countdown = 10
}

export function stopBlackHoleHover() {
    if (bh.sucked) return
    bh.hovering = false
    bh.targetIntensity = 0
}

export function triggerSuck() {
    bh.sucked = true
    bh.suckPhase = 1
    bh.suckTimer = 0
    bh.targetIntensity = 1
}

export function resetBlackHole() {
    bh.sucked = false
    bh.intensity = 0
    bh.targetIntensity = 0
    bh.hovering = false
    bh.suckPhase = 0
    bh.suckTimer = 0
    bh.scenePullX = 0
    bh.scenePullY = 0
    bh.sceneScale = 1
    bh.canvasDriftX = 0
    bh.canvasDriftY = 0
    bh.cursorAttrX = 0
    bh.cursorAttrY = 0
    bh.countdown = 10
}
