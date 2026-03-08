uniform float uTime;
uniform vec2 uResolution;
uniform sampler2D uMainTexture;
uniform sampler2D uDepthTexture;
uniform vec2 uMouse;

in vec2 vUv;
in vec3 worldPosition;

#include "./lib/uv/uvFauxDepth.glsl"

void main()
{
    vec2 uv = vUv;

    // Display image exactly as-is
    vec4 mainColor = texture(uMainTexture, uv);

    gl_FragColor = mainColor;
}
