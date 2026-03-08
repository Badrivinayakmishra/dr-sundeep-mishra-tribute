import { useEffect, useRef } from 'react'
import WebGLFluid from 'webgl-fluid'

export default function FluidCursor() {
    const canvasRef = useRef(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        // Initialize WebGL Fluid simulation - subtle blue theme
        const fluidInstance = WebGLFluid(canvas, {
            IMMEDIATE: true,
            TRIGGER: 'hover',
            SIM_RESOLUTION: 128,
            DYE_RESOLUTION: 512,
            CAPTURE_RESOLUTION: 512,
            DENSITY_DISSIPATION: 2.5,      // Faster fade for subtlety
            VELOCITY_DISSIPATION: 1.5,     // Faster velocity fade
            PRESSURE: 0.6,
            PRESSURE_ITERATIONS: 20,
            CURL: 20,                       // Less curl for cleaner look
            SPLAT_RADIUS: 0.2,             // Smaller splat
            SPLAT_FORCE: 4000,             // Less force
            SHADING: false,                 // No shading for cleaner look
            COLORFUL: false,               // Single color mode
            COLOR_UPDATE_SPEED: 0,
            PAUSED: false,
            BACK_COLOR: { r: 0, g: 0, b: 0 },
            TRANSPARENT: true,
            BLOOM: true,
            BLOOM_ITERATIONS: 6,
            BLOOM_RESOLUTION: 256,
            BLOOM_INTENSITY: 0.4,          // Subtle bloom
            BLOOM_THRESHOLD: 0.7,
            BLOOM_SOFT_KNEE: 0.7,
            SUNRAYS: false,                 // No sunrays for cleaner look
            SUNRAYS_RESOLUTION: 196,
            SUNRAYS_WEIGHT: 0.5,
        })

        return () => {
            // Cleanup if needed
        }
    }, [])

    return (
        <canvas
            ref={canvasRef}
            className="fluid-cursor-canvas"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                pointerEvents: 'none',
                zIndex: 9998,
                opacity: 0.35,              // More subtle opacity
                filter: 'hue-rotate(200deg) saturate(1.5)',  // Shift to blue
            }}
        />
    )
}
