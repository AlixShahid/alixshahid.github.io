import { useEffect } from 'preact/hooks'
import * as THREE from 'three'

import { usePreactRef, mouse, bh } from '$exporter/hook'
import { threeHex } from '$exporter/data'

const STAR_COUNT = 3000

interface Planet {
    mesh: THREE.Mesh
    orbitRadius: number
    orbitSpeed: number
    tilt: number
    angle: number
}

function createSun(): THREE.Group {
    const group = new THREE.Group()
    group.position.set(0, -4, 0)

    const geo = new THREE.SphereGeometry(1, 40, 40)

    const mesh = new THREE.Mesh(
        geo,
        new THREE.MeshStandardMaterial({
            color: threeHex.sunPhoto,
            emissive: threeHex.sunCorona1,
            emissiveIntensity: 0.15,
            roughness: 0.6,
            metalness: 0.0,
            transparent: true,
            opacity: 0.9,
        }),
    )
    group.add(mesh)

    return group
}

const PLANET_DEFS: [number, number, number, number, number, boolean][] = [
    [0.04, 0xaaaaaa, 2.0, 0.008, 0.05, false],
    [0.06, 0xe8c36e, 3.0, 0.006, 0.02, false],
    [0.07, 0x4488cc, 4.4, 0.004, 0.04, false],
    [0.05, 0xcc6644, 5.9, 0.003, 0.03, false],
    [0.2, 0xcc9966, 9.2, 0.0015, 0.02, false],
    [0.16, 0xddbb77, 13.4, 0.001, 0.05, true],
    [0.1, 0x66bbcc, 18.5, 0.0007, 0.08, true],
    [0.09, 0x4466cc, 23.5, 0.0004, 0.03, false],
]

function createPlanets(scene: THREE.Scene): Planet[] {
    const planets: Planet[] = []

    for (const [radius, color, orbitRadius, orbitSpeed, tilt, hasRing] of PLANET_DEFS) {
        const mesh = new THREE.Mesh(
            new THREE.SphereGeometry(radius, 20, 20),
            new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.35 }),
        )

        const glow = new THREE.Mesh(
            new THREE.SphereGeometry(radius * 1.2, 16, 16),
            new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.08 }),
        )
        mesh.add(glow)

        if (hasRing) {
            const ring = new THREE.Mesh(
                new THREE.TorusGeometry(radius * 2.2, 0.015, 8, 64),
                new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.12 }),
            )
            ring.rotation.x = 1.2
            mesh.add(ring)
        }

        scene.add(mesh)
        planets.push({ mesh, orbitRadius, orbitSpeed, tilt, angle: Math.random() * Math.PI * 2 })

        // orbit line
        const points: THREE.Vector3[] = []
        for (let i = 0; i <= 128; i++) {
            const a = (i / 128) * Math.PI * 2
            points.push(new THREE.Vector3(Math.cos(a) * orbitRadius, -4, Math.sin(a) * orbitRadius))
        }
        scene.add(
            new THREE.Line(
                new THREE.BufferGeometry().setFromPoints(points),
                new THREE.LineBasicMaterial({ color: threeHex.green, transparent: true, opacity: 0.02 }),
            ),
        )
    }

    return planets
}

function createStars(scene: THREE.Scene): { geometry: THREE.BufferGeometry; origPositions: Float32Array } {
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(STAR_COUNT * 3)
    const origPositions = new Float32Array(STAR_COUNT * 3)

    for (let i = 0; i < STAR_COUNT; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 60
        positions[i * 3 + 1] = (Math.random() - 0.5) * 60
        positions[i * 3 + 2] = -Math.random() * 40 - 3
    }

    origPositions.set(positions)
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    scene.add(new THREE.Points(geometry, new THREE.PointsMaterial({ color: threeHex.text, size: 0.015, transparent: true, opacity: 0.55 })))

    return { geometry, origPositions }
}

export default function SolarSystem() {
    const canvasRef = usePreactRef<HTMLCanvasElement>()

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
        renderer.setSize(window.innerWidth, window.innerHeight)
        renderer.setPixelRatio(Math.min(devicePixelRatio, 2))

        const scene = new THREE.Scene()
        const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000)
        camera.position.set(0, 14, 22)
        camera.lookAt(0, 0, 0)

        const { geometry: starGeom, origPositions: starOrig } = createStars(scene)

        const sunGroup = createSun()
        scene.add(sunGroup)

        // scene lighting for 3D shading
        const dirLight = new THREE.DirectionalLight(0xfff0dd, 2)
        dirLight.position.set(8, -2, 6)
        scene.add(dirLight)

        const ambLight = new THREE.AmbientLight(0x111111)
        scene.add(ambLight)

        const planets = createPlanets(scene)

        // subtle nebula
        const nebula = new THREE.Mesh(
            new THREE.PlaneGeometry(10, 10),
            new THREE.MeshBasicMaterial({ color: threeHex.green, transparent: true, opacity: 0.004, side: THREE.DoubleSide }),
        )
        nebula.position.set(-8, 0, -10)
        scene.add(nebula)

        const lookVec = new THREE.Vector3()
        const lookDir = new THREE.Vector3()
        let t = 0

        const animate = () => {
            t += 0.006
            const int2 = bh.intensity * bh.intensity

            // planets
            for (const p of planets) {
                p.angle += p.orbitSpeed
                p.mesh.position.x = Math.cos(p.angle) * p.orbitRadius
                p.mesh.position.y = -4 + Math.sin(p.angle) * p.orbitRadius * Math.sin(p.tilt)
                p.mesh.position.z = Math.sin(p.angle) * p.orbitRadius * Math.cos(p.tilt)
                p.mesh.rotation.y += 0.008

                if (bh.intensity > 0.005) {
                    const drift = int2 * p.orbitRadius * 0.25
                    p.mesh.position.x += bh.scenePullX * drift
                    p.mesh.position.y += bh.scenePullY * drift
                    p.mesh.scale.setScalar(Math.max(0.01, 1 - int2 * 1.5))
                } else {
                    const s = p.mesh.scale.x
                    p.mesh.scale.setScalar(s < 0.99 ? s + (1 - s) * 0.03 : 1)
                }
            }

            // sun pulsation
            const pulse = Math.sin(t * 2.5) * 0.06
            const sunMesh = sunGroup.children[0] as THREE.Mesh
            if (sunMesh?.material) {
                const mat = sunMesh.material as THREE.MeshStandardMaterial
                mat.opacity = 0.85 + pulse
                mat.emissiveIntensity = 0.3 + pulse * 0.5
            }
            sunGroup.rotation.y += 0.003

            if (bh.intensity > 0.005) {
                const sunDrift = bh.intensity ** 3 * 12
                sunGroup.position.x += (bh.scenePullX * sunDrift - sunGroup.position.x) * 0.04
                sunGroup.position.y += (-4 + bh.scenePullY * sunDrift - sunGroup.position.y) * 0.04
                const targetSc = Math.max(0.01, 1 - int2 * 1.8)
                const curSc = sunGroup.scale.x
                sunGroup.scale.setScalar(curSc + (targetSc - curSc) * (0.03 + bh.intensity * 0.08))
            } else {
                sunGroup.position.x += (0 - sunGroup.position.x) * 0.05
                sunGroup.position.y += (-4 - sunGroup.position.y) * 0.05
                const curSc = sunGroup.scale.x
                sunGroup.scale.setScalar(curSc < 0.99 ? curSc + (1 - curSc) * 0.03 : 1)
            }

            nebula.rotation.z += 0.0002

            // scene pull from black hole
            if (bh.intensity > 0.005) {
                const ndcX = (bh.curX / window.innerWidth) * 2 - 1
                const ndcY = -(bh.curY / window.innerHeight) * 2 + 1
                const rate = 0.05 + bh.intensity * 0.15
                const target = Math.max(0, 1 - int2 * 1.4)
                bh.scenePullX += (ndcX * bh.intensity * 12 - bh.scenePullX) * rate
                bh.scenePullY += (-ndcY * bh.intensity * 10 - bh.scenePullY) * rate
                bh.sceneScale += (target - bh.sceneScale) * (0.04 + bh.intensity * 0.1)
            } else {
                bh.scenePullX *= 0.95
                bh.scenePullY *= 0.95
                bh.sceneScale += (1 - bh.sceneScale) * 0.03
            }

            camera.position.x = Math.sin(t * 0.2) * 0.15 + bh.scenePullX
            camera.position.y = 14 + Math.cos(t * 0.15) * 0.1 + bh.scenePullY
            camera.lookAt(bh.scenePullX * 0.5, bh.scenePullY * 0.3, 0)
            scene.scale.setScalar(bh.sceneScale)

            // canvas drift toward black hole
            if (bh.intensity > 0.005) {
                const tgtX = (bh.curX - window.innerWidth / 2) * int2 * 0.8
                const tgtY = (bh.curY - window.innerHeight / 2) * int2 * 0.8
                bh.canvasDriftX += (tgtX - bh.canvasDriftX) * (0.03 + bh.intensity * 0.08)
                bh.canvasDriftY += (tgtY - bh.canvasDriftY) * (0.03 + bh.intensity * 0.08)
                canvas.style.transform = `translate(${bh.canvasDriftX}px,${bh.canvasDriftY}px) scale(${Math.max(0.05, bh.sceneScale)})`
            } else if (Math.abs(bh.canvasDriftX) > 0.5 || Math.abs(bh.canvasDriftY) > 0.5) {
                bh.canvasDriftX *= 0.92
                bh.canvasDriftY *= 0.92
                canvas.style.transform = `translate(${bh.canvasDriftX}px,${bh.canvasDriftY}px)`
            } else if (bh.canvasDriftX !== 0) {
                bh.canvasDriftX = 0
                bh.canvasDriftY = 0
                canvas.style.transform = ''
            }

            // star lensing near mouse
            const ndcX2 = (mouse.x / window.innerWidth) * 2 - 1
            const ndcY2 = -(mouse.y / window.innerHeight) * 2 + 1
            lookVec.set(ndcX2, ndcY2, 0.5).unproject(camera)
            lookDir.copy(lookVec).sub(camera.position).normalize()

            const posArr = starGeom.attributes.position.array as Float32Array
            for (let i = 0; i < STAR_COUNT; i++) {
                const i3 = i * 3
                const ox = starOrig[i3] + bh.scenePullX * 0.3
                const oy = starOrig[i3 + 1] + bh.scenePullY * 0.3
                const oz = starOrig[i3 + 2]
                const vx = ox - camera.position.x
                const vy = oy - camera.position.y
                const vz = oz - camera.position.z
                const proj = vx * lookDir.x + vy * lookDir.y + vz * lookDir.z
                if (proj < 0) {
                    posArr[i3] = ox
                    posArr[i3 + 1] = oy
                    posArr[i3 + 2] = oz
                    continue
                }
                const cpx = camera.position.x + lookDir.x * proj
                const cpy = camera.position.y + lookDir.y * proj
                const cpz = camera.position.z + lookDir.z * proj
                const dx = ox - cpx
                const dy = oy - cpy
                const dz = oz - cpz
                const pd = Math.sqrt(dx * dx + dy * dy + dz * dz)
                if (pd < 3.5 && pd > 0.01) {
                    const n = pd / 3.5
                    const push = (0.35 * (1 - n) * n * 4) / (pd + 0.1)
                    posArr[i3] = ox + dx * push
                    posArr[i3 + 1] = oy + dy * push
                    posArr[i3 + 2] = oz + dz * push
                } else {
                    posArr[i3] = ox
                    posArr[i3 + 1] = oy
                    posArr[i3 + 2] = oz
                }
            }
            starGeom.attributes.position.needsUpdate = true

            renderer.render(scene, camera)
            requestAnimationFrame(animate)
        }

        animate()

        const onResize = () => {
            renderer.setSize(window.innerWidth, window.innerHeight)
            camera.aspect = window.innerWidth / window.innerHeight
            camera.updateProjectionMatrix()
        }
        window.addEventListener('resize', onResize)

        return () => {
            window.removeEventListener('resize', onResize)
            renderer.dispose()
        }
    }, [])

    return <canvas ref={canvasRef} id="bg" style={{ position: 'fixed', inset: '0', zIndex: 0 }} />
}
