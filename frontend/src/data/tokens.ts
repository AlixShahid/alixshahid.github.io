// ─── RGB tuples ───
export const rgb = {
    green: [32, 194, 14] as const,
    amber: [232, 163, 23] as const,
    red: [232, 64, 64] as const,
    text: [204, 204, 204] as const,
    white: [255, 255, 255] as const,
} as const

// ─── Hex (CSS + Three.js) ───
export const hex = {
    bg: '#0a0a0a',
    green: '#20c20e',
    amber: '#e8a317',
    red: '#e84040',
    text: '#cccccc',
    textBright: '#f2f2f2',
    blue: '#5f87ff',
} as const

// ─── Three.js colors (numeric) ───
export const threeHex = {
    green: 0x20c20e,
    text: 0xcccccc,
    sunCore: 0xffffff,
    sunPhoto: 0xffd633,
    sunChromo: 0xff9933,
    sunCorona1: 0xff7722,
    sunCorona2: 0xff5500,
    sunAtm: 0xff8844,
} as const

// ─── Particle / canvas palettes ───
export const palette = {
    clickSpark: [hex.green, hex.amber, hex.text] as const,
    keystroke: [hex.green, hex.amber] as const,
    death: [hex.green, hex.amber, '#ff5f57', hex.text, 'rgba(255,180,80,1)'] as const,
} as const

// ─── Helpers ───
export function rgba([r, g, b]: readonly number[], a: number): string {
    return `rgba(${r},${g},${b},${a})`
}
export function cssVars(): string {
    const [gr, gg, gb] = rgb.green
    const [ar, ag, ab] = rgb.amber
    return `
        --bg: ${hex.bg};
        --terminal-bg: rgba(8, 8, 8, 0.96);
        --blue: ${hex.blue};
        --green: ${hex.green};
        --green-glow: ${gr}, ${gg}, ${gb};
        --amber: ${hex.amber};
        --amber-glow: ${ar}, ${ag}, ${ab};
        --red: ${hex.red};
        --text: ${hex.text};
        --text-dim: ${rgba(rgb.text, 0.45)};
        --text-bright: ${hex.textBright};
        --border-hi: ${rgba(rgb.green, 0.2)};
        --font-terminal: 1.4rem;
        --font-terminal-mobile: 0.95rem;
    `
}
