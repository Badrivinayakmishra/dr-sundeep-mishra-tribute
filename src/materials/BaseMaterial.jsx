import { shaderMaterial, useTexture } from '@react-three/drei'
import { extend, useFrame } from '@react-three/fiber'
import React, { useRef, useMemo, useEffect } from 'react'
import vertex from '../shaders/vertex.glsl'
import fragment from '../shaders/fragment.glsl'
import { Vector2, SRGBColorSpace } from 'three'
import useMouse from '../hooks/useMouse'

export default function BaseMaterial({
    mainTexture = './images/doctor-hero.png',
    depthTexture = './images/doctor-depth.png',
    ...props
}) {
    const self = useRef()

    const textureMain = useTexture(mainTexture)
    const textureDepth = useTexture(depthTexture)

    // Set correct color space for the texture
    useEffect(() => {
        if (textureMain) {
            textureMain.colorSpace = SRGBColorSpace
        }
    }, [textureMain])

    // mouse coordinates
    const mouse = useMouse()

    const uniforms = useMemo(() => ({
        uTime: 0,
        uResolution: new Vector2(window.innerWidth, window.innerHeight),
        uMainTexture: textureMain,
        uDepthTexture: textureDepth,
        uMouse: new Vector2(0, 0),
    }), [textureMain, textureDepth])

    useFrame((state, delta) => {
        if (!self.current) return

        self.current.uniforms.uTime.value += delta

        // Calculate normalized mouse position
        const halfX = window.innerWidth / 2
        const halfY = window.innerHeight / 2

        const tx = (halfX - mouse.x) / halfX
        const ty = (halfY - mouse.y) / halfY

        const targetX = tx * 0.06  // Subtle parallax to avoid distortion
        const targetY = ty * 0.06  // Subtle parallax to avoid distortion

        // Smooth interpolation
        self.current.uniforms.uMouse.value.x += (targetX - self.current.uniforms.uMouse.value.x) * 0.08
        self.current.uniforms.uMouse.value.y += (targetY - self.current.uniforms.uMouse.value.y) * 0.08
    })

    const DoctorMaterial = useMemo(() => {
        return shaderMaterial(uniforms, vertex, fragment)
    }, [])

    extend({ DoctorMaterial })

    return (
        <doctorMaterial
            key={DoctorMaterial.key}
            ref={self}
            transparent={true}
            {...props}
        />
    )
}
