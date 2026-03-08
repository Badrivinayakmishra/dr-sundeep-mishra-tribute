import { useRef } from 'react'
import BaseMaterial from '../materials/BaseMaterial.jsx'

export default function BasePlane() {
    const self = useRef()

    return (
        <mesh ref={self} position={[2.5, 0, 0]}>
            <planeGeometry args={[7, 7, 64, 64]} />
            <BaseMaterial />
        </mesh>
    )
}
