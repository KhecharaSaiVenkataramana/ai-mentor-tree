import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, Float } from '@react-three/drei'
import * as THREE from 'three'

// ── Utility: hex string → THREE.Color ──────────────────────────────────────
function hexToColor(hex) {
  return new THREE.Color(hex)
}

// ── A single branch segment ─────────────────────────────────────────────────
function Branch({ start, end, radius, leafColor, isThinking }) {
  const meshRef = useRef()
  const direction = new THREE.Vector3().subVectors(end, start)
  const length = direction.length()
  const midpoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5)

  const quaternion = useMemo(() => {
    const q = new THREE.Quaternion()
    const up = new THREE.Vector3(0, 1, 0)
    const dir = direction.clone().normalize()
    q.setFromUnitVectors(up, dir)
    return q
  }, [start, end])

  useFrame((state) => {
    if (meshRef.current && isThinking) {
      meshRef.current.material.emissiveIntensity =
        0.3 + Math.sin(state.clock.elapsedTime * 3) * 0.2
    }
  })

  return (
    <mesh ref={meshRef} position={midpoint} quaternion={quaternion}>
      <cylinderGeometry args={[radius * 0.7, radius, length, 8]} />
      <meshStandardMaterial
        color="#5C3D1E"
        roughness={0.9}
        metalness={0.0}
        emissive={isThinking ? leafColor : '#000000'}
        emissiveIntensity={isThinking ? 0.3 : 0}
      />
    </mesh>
  )
}

// ── Leaf cluster (sphere) ───────────────────────────────────────────────────
function LeafCluster({ position, size, leafColor, isThinking, delay = 0 }) {
  const meshRef = useRef()

  useFrame((state) => {
    if (!meshRef.current) return
    const t = state.clock.elapsedTime + delay
    meshRef.current.position.y = position[1] + Math.sin(t * 0.8) * 0.05
    if (isThinking) {
      meshRef.current.material.emissiveIntensity =
        0.4 + Math.sin(t * 4) * 0.3
    } else {
      meshRef.current.material.emissiveIntensity = 0.05
    }
  })

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[size, 10, 10]} />
      <meshStandardMaterial
        color={leafColor}
        roughness={0.8}
        metalness={0.0}
        emissive={leafColor}
        emissiveIntensity={0.05}
        transparent
        opacity={0.92}
      />
    </mesh>
  )
}

// ── Roots sprawling at base ─────────────────────────────────────────────────
function Roots({ leafColor }) {
  const roots = useMemo(() => {
    const arr = []
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2
      const len = 0.5 + Math.random() * 0.4
      arr.push({
        start: new THREE.Vector3(0, -1.4, 0),
        end: new THREE.Vector3(
          Math.cos(angle) * len,
          -1.7 - Math.random() * 0.2,
          Math.sin(angle) * len
        ),
        radius: 0.06,
      })
    }
    return arr
  }, [])

  return roots.map((r, i) => (
    <Branch key={i} {...r} leafColor={leafColor} isThinking={false} />
  ))
}

// ── Procedural Tree ─────────────────────────────────────────────────────────
function ProceduralTree({ leafColor, ambientColor, isThinking }) {
  const color = hexToColor(leafColor)

  // Trunk
  const trunkSegments = [
    { start: new THREE.Vector3(0, -1.5, 0), end: new THREE.Vector3(0, 0, 0), radius: 0.18 },
    { start: new THREE.Vector3(0, 0, 0), end: new THREE.Vector3(0, 1.0, 0), radius: 0.13 },
  ]

  // Primary branches
  const branches = [
    { start: new THREE.Vector3(0, 0.4, 0), end: new THREE.Vector3(0.9, 1.2, 0.2), radius: 0.08 },
    { start: new THREE.Vector3(0, 0.4, 0), end: new THREE.Vector3(-0.85, 1.1, -0.1), radius: 0.08 },
    { start: new THREE.Vector3(0, 0.7, 0), end: new THREE.Vector3(0.3, 1.5, 0.6), radius: 0.06 },
    { start: new THREE.Vector3(0, 0.7, 0), end: new THREE.Vector3(-0.4, 1.6, -0.5), radius: 0.06 },
    { start: new THREE.Vector3(0, 0.9, 0), end: new THREE.Vector3(0.1, 1.8, -0.3), radius: 0.05 },
  ]

  // Secondary branches
  const secondary = [
    { start: new THREE.Vector3(0.9, 1.2, 0.2), end: new THREE.Vector3(1.4, 1.7, 0.4), radius: 0.045 },
    { start: new THREE.Vector3(0.9, 1.2, 0.2), end: new THREE.Vector3(1.1, 1.8, -0.1), radius: 0.04 },
    { start: new THREE.Vector3(-0.85, 1.1, -0.1), end: new THREE.Vector3(-1.3, 1.6, 0.2), radius: 0.045 },
    { start: new THREE.Vector3(-0.85, 1.1, -0.1), end: new THREE.Vector3(-1.1, 1.7, -0.5), radius: 0.04 },
    { start: new THREE.Vector3(0.3, 1.5, 0.6), end: new THREE.Vector3(0.6, 2.0, 0.7), radius: 0.035 },
    { start: new THREE.Vector3(-0.4, 1.6, -0.5), end: new THREE.Vector3(-0.7, 2.1, -0.6), radius: 0.035 },
  ]

  // Leaf clusters
  const leaves = [
    { position: [1.4, 1.9, 0.4], size: 0.55 },
    { position: [1.1, 2.0, -0.1], size: 0.45 },
    { position: [-1.3, 1.8, 0.3], size: 0.52 },
    { position: [-1.1, 1.9, -0.5], size: 0.47 },
    { position: [0.6, 2.2, 0.7], size: 0.48 },
    { position: [-0.7, 2.3, -0.6], size: 0.50 },
    { position: [0.1, 2.1, -0.3], size: 0.55 },
    { position: [0, 2.0, 0], size: 0.65 },
    { position: [-0.2, 2.4, 0.2], size: 0.42 },
    { position: [0.4, 2.3, -0.4], size: 0.40 },
  ]

  return (
    <group position={[0, 0, 0]}>
      <Roots leafColor={leafColor} />
      {trunkSegments.map((s, i) => (
        <Branch key={`trunk-${i}`} {...s} leafColor={leafColor} isThinking={isThinking} />
      ))}
      {branches.map((b, i) => (
        <Branch key={`branch-${i}`} {...b} leafColor={leafColor} isThinking={isThinking} />
      ))}
      {secondary.map((b, i) => (
        <Branch key={`sec-${i}`} {...b} leafColor={leafColor} isThinking={isThinking} />
      ))}
      {leaves.map((l, i) => (
        <LeafCluster
          key={`leaf-${i}`}
          {...l}
          leafColor={leafColor}
          isThinking={isThinking}
          delay={i * 0.4}
        />
      ))}
      {/* Ground disc */}
      <mesh position={[0, -1.75, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.2, 40]} />
        <meshStandardMaterial color="#1a2e12" roughness={1} />
      </mesh>
    </group>
  )
}

// ── Firefly particles ───────────────────────────────────────────────────────
function Fireflies({ count = 30, treeReactionColor }) {
  const meshRef = useRef()
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 6
      arr[i * 3 + 1] = Math.random() * 4 - 1
      arr[i * 3 + 2] = (Math.random() - 0.5) * 6
    }
    return arr
  }, [count])

  useFrame((state) => {
    if (!meshRef.current) return
    const pos = meshRef.current.geometry.attributes.position.array
    for (let i = 0; i < count; i++) {
      const t = state.clock.elapsedTime + i * 0.7
      pos[i * 3] += Math.sin(t * 0.3 + i) * 0.003
      pos[i * 3 + 1] += Math.cos(t * 0.5 + i) * 0.003
      pos[i * 3 + 2] += Math.sin(t * 0.4 + i * 1.3) * 0.003
      // Wrap
      if (pos[i * 3 + 1] > 4) pos[i * 3 + 1] = -1
    }
    meshRef.current.geometry.attributes.position.needsUpdate = true
    meshRef.current.material.color.set(treeReactionColor)
  })

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.04} color={treeReactionColor} transparent opacity={0.7} />
    </points>
  )
}

// ── Scene ───────────────────────────────────────────────────────────────────
function Scene({ treeReaction, isThinking }) {
  const ambientColor = treeReaction
  const leafColor = treeReaction

  return (
    <>
      <ambientLight intensity={0.3} color="#ffffff" />
      <directionalLight position={[3, 5, 3]} intensity={0.8} color="#fffde0" castShadow />
      <pointLight position={[0, 2, 0]} intensity={1.5} color={ambientColor} distance={8} />
      <pointLight position={[-2, 0, 2]} intensity={0.6} color={ambientColor} distance={6} />
      <fog attach="fog" args={['#0a0f0a', 8, 18]} />
      <Fireflies count={35} treeReactionColor={treeReaction} />
      <Float speed={0.6} rotationIntensity={0.15} floatIntensity={0.2}>
        <ProceduralTree
          leafColor={leafColor}
          ambientColor={ambientColor}
          isThinking={isThinking}
        />
      </Float>
    </>
  )
}

// ── Main export ─────────────────────────────────────────────────────────────
export default function TreeCanvas({ treeReaction, isThinking }) {
  return (
    <Canvas
      camera={{ position: [0, 1, 5], fov: 50 }}
      shadows
      style={{ width: '100%', height: '100%', background: 'transparent' }}
    >
      <Scene treeReaction={treeReaction} isThinking={isThinking} />
      <OrbitControls
        enablePan={false}
        minDistance={3}
        maxDistance={9}
        minPolarAngle={Math.PI * 0.15}
        maxPolarAngle={Math.PI * 0.75}
        autoRotate
        autoRotateSpeed={isThinking ? 3 : 0.6}
      />
    </Canvas>
  )
}
