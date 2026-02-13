import { marked } from 'marked'
import {
    FS_TREE,
    FILE_CONTENT,
    COMMANDS,
} from '$exporter/data'

// configure marked for terminal
marked.setOptions({
    breaks: true,
    gfm: true,
})

let cwd = '/'

function renderMd(content: string): string[] {
    const html = marked.parse(content) as string
    return [`<div class="tmd">${html}</div>`]
}

export function execCommand(cmd: string, args: string[]): string[] {
    switch (cmd) {
        case 'help':
            return cmdHelp()
        case 'about':
            return renderMd(FILE_CONTENT['my-info/about.md'])
        case 'skills':
            return renderMd(FILE_CONTENT['my-info/skills.md'])
        case 'experience':
            return renderMd(FILE_CONTENT['my-info/experience.md'])
        case 'contact':
            return renderMd(FILE_CONTENT['my-info/contact.md'])
        case 'projects':
            return renderMd(FILE_CONTENT['my-info/projects.md'])
        case 'ls':
            return cmdLs(args)
        case 'cat':
            return cmdCat(args)
        case 'cd':
            return cmdCd(args)
        case 'echo':
            return [args.join(' ')]
        case 'date':
            return [`<span class="th">${new Date().toString()}</span>`]
        case 'pwd':
            return [`<span class="th">${cwd}</span>`]
        case 'uname':
            return [`<span class="th">ShahidOS 3.0 x86_64 preact/vite</span>`]
        case 'whoami':
            return [`<span class="th">ali@shahid</span>`]
        case 'sudo':
            return ['<span class="te">✖ nice try. access denied.</span>']
        default:
            return [`<span class="te">command not found: ${cmd}</span> <span class="td">— type <span class="tc">help</span></span>`]
    }
}

function cmdHelp(): string[] {
    const cmds: [string, string][] = [
        ['about', 'who I am'],
        ['skills', 'what I know'],
        ['experience', 'where I\'ve been'],
        ['contact', 'reach me'],
        ['projects', 'what I\'ve built'],
        ['ls [dir]', 'list files'],
        ['cd [dir]', 'change directory'],
        ['cat <file>', 'read a file'],
        ['clear', 'wipe terminal'],
        ['matrix', 'toggle matrix rain'],
        ['exit', 'close terminal'],
    ]
    const lines: string[] = ['']
    for (const [c, d] of cmds) {
        lines.push(`  <span class="tc">${c.padEnd(16)}</span> <span class="td">${d}</span>`)
    }
    lines.push('')
    return lines
}

export function getCwd(): string {
    return cwd === '/' ? '~' : `~${cwd}`
}

export function getCompletions(partial: string): { complete: string | null; options: string[] } {
    const parts = partial.trimStart().split(/\s+/)
    const cmd = parts[0]?.toLowerCase()

    if (parts.length <= 1 && cmd) {
        const matches = COMMANDS.filter(c => c.startsWith(cmd) && c !== cmd)
        if (matches.length === 1) return { complete: matches[0], options: [] }
        const prefix = commonPrefix(matches)
        if (prefix && prefix !== cmd) return { complete: prefix, options: [] }
        return { complete: null, options: matches }
    }

    const arg = parts.slice(1).join(' ').trim()

    if (cmd === 'cd' || cmd === 'ls') {
        const dirs = getAllDirs()
        const matches = arg
            ? dirs.filter(d => d.toLowerCase().startsWith(arg.toLowerCase()) && d.toLowerCase() !== arg.toLowerCase())
            : dirs
        if (matches.length === 1) return { complete: `${cmd} ${matches[0]}`, options: [] }
        const prefix = commonPrefix(matches)
        if (prefix && prefix.toLowerCase() !== arg.toLowerCase()) return { complete: `${cmd} ${prefix}`, options: [] }
        return { complete: null, options: matches }
    }

    if (cmd === 'cat') {
        const files = getVisibleFiles()
        const matches = arg
            ? files.filter(f => f.toLowerCase().startsWith(arg.toLowerCase()) && f.toLowerCase() !== arg.toLowerCase())
            : files
        if (matches.length === 1) return { complete: `${cmd} ${matches[0]}`, options: [] }
        const prefix = commonPrefix(matches)
        if (prefix && prefix.toLowerCase() !== arg.toLowerCase()) return { complete: `${cmd} ${prefix}`, options: [] }
        return { complete: null, options: matches }
    }

    return { complete: null, options: [] }
}

function commonPrefix(strings: string[]): string {
    if (!strings.length) return ''
    let prefix = strings[0]
    for (let i = 1; i < strings.length; i++) {
        while (!strings[i].toLowerCase().startsWith(prefix.toLowerCase())) {
            prefix = prefix.slice(0, -1)
            if (!prefix) return ''
        }
    }
    return prefix
}

function getAllDirs(): string[] {
    return Object.keys(FS_TREE)
        .filter(d => d !== '/')
        .map(d => d.slice(1))
}

function getVisibleFiles(): string[] {
    const entries = FS_TREE[cwd] || []
    const results: string[] = []
    for (const e of entries) {
        if (e.endsWith('/')) {
            // add files inside subdirectory too
            const subPath = cwd === '/' ? `/${e.slice(0, -1)}` : `${cwd}/${e.slice(0, -1)}`
            const subEntries = FS_TREE[subPath]
            if (subEntries) {
                for (const se of subEntries) {
                    if (!se.endsWith('/')) {
                        const prefix = cwd === '/' ? e : `${e}`
                        results.push(`${prefix}${se}`)
                    }
                }
            }
        } else {
            results.push(e)
        }
    }
    return results
}


function cmdLs(args: string[]): string[] {
    const target = args[0] || cwd
    const resolved = resolvePath(target)
    const entries = FS_TREE[resolved]
    if (!entries) return [`<span class="te">ls: cannot access '${target}': No such directory</span>`]
    const colored = entries.map(e =>
        // e.endsWith('/') ? `<span class="tc">${e}</span>` : `<span class="th">${e}</span>`
        e.endsWith('/') ? `<span style="color:var(--blue);">${e}</span>` : `<span class="th">${e}</span>`

    )
    return [colored.join('  ')]
}

function cmdCd(args: string[]): string[] {
    const target = args[0] || '/'
    const resolved = resolvePath(target)
    if (FS_TREE[resolved]) {
        cwd = resolved
        return []
    }
    return [`<span class="te">cd: no such directory: ${target}</span>`]
}

function cmdCat(args: string[]): string[] {
    if (!args.length) return ['<span class="te">cat: missing filename</span>']
    const filename = args[0]

    // resolve relative to cwd
    let filepath = filename
    if (!filename.includes('/')) {
        filepath = cwd === '/' ? filename : `${cwd.slice(1)}/${filename}`
    } else if (filename.startsWith('/')) {
        filepath = filename.slice(1)
    }

    const content = FILE_CONTENT[filepath]
    if (!content) return [`<span class="te">cat: ${filename}: No such file</span>`]
    return renderMd(content)
}


function resolvePath(target: string): string {
    if (target === '/' || target === '~') return '/'
    if (target === '..') return '/'
    if (target === '.') return cwd

    let path = target.replace(/\/+$/, '')
    if (!path.startsWith('/')) {
        path = cwd === '/' ? `/${path}` : `${cwd}/${path}`
    }
    return path
}
