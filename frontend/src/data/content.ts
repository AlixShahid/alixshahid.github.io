export const SECTIONS = ['hero', 'about', 'interests', 'work', 'contact'] as const
export type SectionId = (typeof SECTIONS)[number]

export const NAV_LABELS: Record<SectionId, string> = {
    hero: 'home',
    about: 'about',
    interests: 'expertise',
    work: 'work',
    contact: 'contact',
}

export const SOCIAL_LINKS = {
    github: 'https://github.com/AlixShahid',
    linkedin: 'https://linkedin.com/in/AlixShahid',
    email: 'alixshahid@gmail.com',
} as const

export const ABOUT_TEXT = `Software Engineer focused on building scalable, production-grade systems across the full stack. I specialize in designing event-driven microservices, real-time data pipelines, and low-latency trading infrastructure. My work spans backend architecture, API design, cross-platform mobile development, and AI-integrated platforms.
I'm deeply curious about mathematics, physics, and how complex systems work at a fundamental level. That curiosity shapes how I approach engineering: I enjoy digging into problems, experimenting with new ideas, and understanding things from first principles. I started my journey self-taught through open-source contributions and freelancing, and that explorer's mindset still drives everything I build.
Always learning, always building. Open to collaboration and meaningful opportunities.`

export type ExpertiseIconId = 'systems' | 'blockchain' | 'distributed' | 'mobile' | 'research' | 'opensource'

export interface ExpertiseItem {
    icon: ExpertiseIconId
    label: string
    desc: string
}

export const EXPERTISE_ITEMS: ExpertiseItem[] = [
    {
        icon: 'systems',
        label: 'Systems Programming',
        desc: 'Building performant, memory-safe backend services and async runtimes with Rust and Python — focused on correctness, concurrency, and speed.',
    },
    {
        icon: 'blockchain',
        label: 'Blockchain Research',
        desc: 'Building custom Layer 1 blockchains from scratch — consensus mechanisms, runtime modules, transaction indexing, and integrating smart contract support.',
    },
    {
        icon: 'distributed',
        label: 'Distributed Systems',
        desc: 'Event-driven microservices, async messaging, real-time data pipelines, and designing architectures that scale horizontally.',
    },
    {
        icon: 'mobile',
        label: 'Cross-Platform Apps',
        desc: 'Building native-quality mobile and web apps with React and React Native/Expo — from UI design to deployment, all from a unified codebase.',
    },
    {
        icon: 'research',
        label: 'Research & Science',
        desc: 'Exploring computation, number theory, and physics simulations. Drawn to problems where mathematical thinking meets practical engineering.',
    },
    {
        icon: 'opensource',
        label: 'Open Source',
        desc: 'Active contributor to developer tooling, automation, and community projects. Building and maintaining tools that other developers use daily.',
    },
]

export interface WorkItem {
    date: string
    role: string
    location: string
    desc: string
    tags: string[]
}

export const WORK_ITEMS: WorkItem[] = [
    {
        date: '2025 — 2026',
        role: 'Tech Lead / Full-Stack Engineer',
        location: 'Dubai, UAE',
        desc: 'Led the engineering team behind an AI-powered trading signals platform. Designed the backend architecture with event-driven microservices and real-time data pipelines, and shipped cross-platform mobile apps.',
        tags: ['Rust', 'React Native', 'Microservices', 'AI/ML'],
    },
    {
        date: '2025',
        role: 'Backend & Blockchain Developer',
        location: 'Dubai, UAE',
        desc: 'Built a custom Layer 1 blockchain from scratch — designed the runtime, consensus layer, transaction indexing, and integrated smart contract support. Developed the backend APIs and infrastructure around it.',
        tags: ['Rust', 'Blockchain', 'Custom L1', 'Backend'],
    },
    {
        date: '2024 — 2025',
        role: 'Backend Engineer',
        location: 'Dubai, UAE',
        desc: 'Rebuilt an algorithmic trading platform from a monolith into a self-service microservice system with async processing and auto-generated API docs.',
        tags: ['Rust', 'Python', 'Microservices', 'APIs'],
    },
    {
        date: '2022 — 2024',
        role: 'Full-Stack Engineer',
        location: 'Dubai, UAE',
        desc: 'Delivered client-facing web and mobile applications end-to-end, owning the full lifecycle from requirements through deployment.',
        tags: ['React', 'TypeScript', 'React Native', 'Full-Stack'],
    },
    {
        date: '2018 — 2022',
        role: 'Freelance Engineer',
        location: 'Remote · Nepal',
        desc: 'Built custom software for clients across web and backend, handling end-to-end delivery from requirements to deployment.',
        tags: ['Python', 'JavaScript', 'Full-Stack', 'Automation'],
    },
]
