import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshReflectorMaterial } from '@react-three/drei'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

function arc(points, color, radius = .052) {
  const curve = new THREE.CatmullRomCurve3(points.map(([x, y, z]) => new THREE.Vector3(x, y, z)), false, 'centripetal')
  return <mesh geometry={new THREE.TubeGeometry(curve, 64, radius, 12, false)}><meshPhysicalMaterial color={color} metalness={.95} roughness={.18} /></mesh>
}
function Sculpture() {
  const rig = useRef(); const halo = useRef()
  const pieces = useMemo(() => [
    [[-1.1,-1.25,0],[-.68,.18,.2],[-.14,1.25,0],[.45,.16,-.15],[1.05,-1.22,.04]],
    [[-1.05,-.45,.1],[-.25,-.13,.2],[.35,-.12,.16],[1.05,-.48,.02]],
    [[-.78,1.08,-.28],[-.08,.72,-.4],[.7,1.08,-.28]],
  ], [])
  useFrame((state, delta) => { if (document.hidden) return; const { x, y } = state.pointer; rig.current.rotation.y += (x * .36 - rig.current.rotation.y) * delta * 1.5; rig.current.rotation.x += (-y * .22 - rig.current.rotation.x) * delta * 1.5; halo.current.rotation.z += delta * .08 })
  return <group ref={rig} rotation={[.05,-.2,0]}><Float speed={1} rotationIntensity={.06} floatIntensity={.4}>{pieces.map((piece, i) => <group key={i}>{arc(piece, i === 1 ? '#315cff' : '#d9d7d0', i === 1 ? .04 : .06)}{piece.map(([x,y,z], j) => <mesh position={[x,y,z]} key={j}><sphereGeometry args={[j === 2 ? .105 : .075,20,20]}/><meshPhysicalMaterial color={i === 1 ? '#315cff' : '#e9e7e0'} metalness={1} roughness={.16}/></mesh>)}</group>)}<mesh ref={halo} rotation={[1.15,.2,0]}><torusGeometry args={[1.45,.012,10,96]}/><meshBasicMaterial color="#315cff" transparent opacity={.65}/></mesh></Float></group>
}
export default function HeroScene(){return <Canvas dpr={[1,1.35]} camera={{position:[0,0,4.5],fov:40}} aria-label="Interactive abstract letterform sculpture"><color attach="background" args={['#0b0b0b']}/><ambientLight intensity={.5}/><spotLight position={[3,5,4]} angle={.6} penumbra={1} intensity={7} color="#f2f0ea"/><pointLight position={[-3,-1,2]} intensity={5} color="#315cff"/><Sculpture/><mesh position={[0,-1.57,-.2]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[200,200]}/><MeshReflectorMaterial blur={[300,70]} resolution={256} mixBlur={1} mixStrength={8} roughness={1} color="#0b0b0b" metalness={.4}/></mesh></Canvas>}
