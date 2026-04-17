'use client';

import { Effect, EffectComposer, EffectPass, RenderPass } from 'postprocessing';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

type Variant = 'square' | 'circle' | 'triangle' | 'diamond';
const MAX_CLICKS = 10;

const SHAPE_MAP: Record<Variant, number> = {
  square: 0,
  circle: 1,
  triangle: 2,
  diamond: 3,
};

interface PixelBlastProps {
  variant?: Variant;
  pixelSize?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
  patternScale?: number;
  patternDensity?: number;
  pixelSizeJitter?: number;
  enableRipples?: boolean;
  rippleSpeed?: number;
  rippleThickness?: number;
  rippleIntensityScale?: number;
  speed?: number;
  edgeFade?: number;
  transparent?: boolean;
  noiseAmount?: number;
  intensity?: number; // compatibility alias for old usage
}

const VERTEX_SRC = `void main(){ gl_Position = vec4(position, 1.0); }`;

const FRAGMENT_SRC = `
precision highp float;

uniform vec3  uColor;
uniform vec2  uResolution;
uniform float uTime;
uniform float uPixelSize;
uniform float uScale;
uniform float uDensity;
uniform float uPixelJitter;
uniform int   uEnableRipples;
uniform float uRippleSpeed;
uniform float uRippleThickness;
uniform float uRippleIntensity;
uniform float uEdgeFade;
uniform int   uShapeType;

const int MAX_CLICKS = 10;
uniform vec2  uClickPos  [MAX_CLICKS];
uniform float uClickTimes[MAX_CLICKS];

out vec4 fragColor;

float hash21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float n2(vec2 p){
  vec2 i = floor(p), f = fract(p);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}
float fbm(vec2 p){
  float s = 0.0;
  float a = 0.5;
  for(int i=0;i<5;i++){
    s += a * n2(p);
    p *= 1.9;
    a *= 0.55;
  }
  return s;
}

float maskCircle(vec2 p, float cov){
  float r = sqrt(max(cov, 0.0)) * 0.5;
  float d = length(p - 0.5) - r;
  float aa = fwidth(d);
  return 1.0 - smoothstep(-aa, aa, d);
}
float maskDiamond(vec2 p, float cov){
  float r = sqrt(max(cov, 0.0)) * 0.7;
  return step(abs(p.x - 0.5) + abs(p.y - 0.5), r);
}
float maskTriangle(vec2 p, vec2 id, float cov){
  bool flip = mod(id.x + id.y, 2.0) > 0.5;
  if (flip) p.x = 1.0 - p.x;
  float r = sqrt(max(cov, 0.0));
  float d = p.y - r * (1.0 - p.x);
  float aa = fwidth(d) + 0.001;
  return clamp(0.5 - d / aa, 0.0, 1.0);
}

void main() {
  vec2 frag = gl_FragCoord.xy;
  vec2 uv = frag / uResolution;
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  float px = max(uPixelSize, 1.0);

  vec2 gid = floor(frag / px);
  vec2 puv = fract(frag / px);
  vec2 nUV = (gid * px / uResolution) * vec2(aspect, 1.0);

  float feed = fbm(nUV * uScale + uTime * 0.12);
  // Bias coverage toward the top of the screen so the effect appears to originate from above.
  float topBias = smoothstep(-0.1, 0.85, uv.y);
  feed += topBias * 0.22;
  feed += (uDensity - 1.0) * 0.25;

  if (uEnableRipples == 1) {
    for (int i = 0; i < MAX_CLICKS; i++) {
      vec2 c = uClickPos[i];
      if (c.x < 0.0) continue;
      float dt = max(0.0, uTime - uClickTimes[i]);
      vec2 cuv = c / uResolution;
      float r = distance(uv, cuv);
      float wave = uRippleSpeed * dt;
      float ring = exp(-pow((r - wave) / max(uRippleThickness, 0.0001), 2.0));
      float damp = exp(-1.2 * dt) * exp(-10.0 * r);
      feed = max(feed, ring * damp * uRippleIntensity);
    }
  }

  float dither = hash21(gid) - 0.5;
  float coverage = step(0.5, feed + dither * 0.35);

  if (uPixelJitter > 0.0) {
    float jitter = (hash21(gid + 17.3) - 0.5) * uPixelJitter;
    coverage = clamp(coverage + jitter, 0.0, 1.0);
  }

  float shapeMask = coverage;
  if (uShapeType == 1) shapeMask *= maskCircle(puv, coverage);
  else if (uShapeType == 2) shapeMask *= maskTriangle(puv, gid, coverage);
  else if (uShapeType == 3) shapeMask *= maskDiamond(puv, coverage);

  if (uEdgeFade > 0.0) {
    // Keep top fully visible: only fade left/right edges and the bottom edge.
    float edge = min(min(uv.x, 1.0 - uv.x), uv.y);
    shapeMask *= smoothstep(0.0, uEdgeFade, edge);
  }

  fragColor = vec4(uColor, shapeMask);
}
`;

export function PixelBlast({
  variant = 'circle',
  pixelSize = 6,
  color = '#E8832A',
  className,
  style,
  patternScale = 2.7,
  patternDensity = 1.2,
  pixelSizeJitter = 0.45,
  enableRipples = true,
  rippleSpeed = 0.35,
  rippleThickness = 0.1,
  rippleIntensityScale = 1.5,
  speed = 0.6,
  edgeFade = 0.25,
  transparent = true,
  noiseAmount = 0,
  intensity,
}: PixelBlastProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    if (transparent) renderer.setClearAlpha(0);
    else renderer.setClearColor(0x000000, 1);
    container.appendChild(renderer.domElement);

    const uniforms = {
      uResolution: new THREE.Uniform(new THREE.Vector2(1, 1)),
      uTime: new THREE.Uniform(0),
      uColor: new THREE.Uniform(new THREE.Color(color)),
      uPixelSize: new THREE.Uniform(pixelSize * renderer.getPixelRatio()),
      uScale: new THREE.Uniform(patternScale),
      uDensity: new THREE.Uniform(intensity !== undefined ? 0.8 + intensity * 2.0 : patternDensity),
      uPixelJitter: new THREE.Uniform(pixelSizeJitter),
      uEnableRipples: new THREE.Uniform(enableRipples ? 1 : 0),
      uRippleSpeed: new THREE.Uniform(rippleSpeed),
      uRippleThickness: new THREE.Uniform(rippleThickness),
      uRippleIntensity: new THREE.Uniform(rippleIntensityScale),
      uEdgeFade: new THREE.Uniform(edgeFade),
      uShapeType: new THREE.Uniform(SHAPE_MAP[variant]),
      uClickPos: new THREE.Uniform(Array.from({ length: MAX_CLICKS }, () => new THREE.Vector2(-1, -1))),
      uClickTimes: new THREE.Uniform(new Float32Array(MAX_CLICKS)),
    };

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const material = new THREE.ShaderMaterial({
      vertexShader: VERTEX_SRC,
      fragmentShader: FRAGMENT_SRC,
      uniforms,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      glslVersion: THREE.GLSL3,
    });
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(quad);

    let composer: EffectComposer | null = null;
    let noiseTimeUniform: THREE.Uniform<number> | null = null;
    if (noiseAmount > 0) {
      composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));
      const noiseFx = new Effect(
        'NoiseFx',
        `
        uniform float uTime;
        uniform float uAmount;
        float h(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
        void mainUv(inout vec2 uv){}
        void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor){
          float n = h(floor(uv * vec2(1920.0, 1080.0) + uTime * 16.0));
          outputColor = inputColor + vec4(vec3((n - 0.5) * uAmount), 0.0);
        }`,
        {
          uniforms: new Map([
            ['uTime', new THREE.Uniform(0)],
            ['uAmount', new THREE.Uniform(noiseAmount)],
          ]),
        }
      );
      const noisePass = new EffectPass(camera, noiseFx);
      noisePass.renderToScreen = true;
      composer.addPass(noisePass);
      noiseTimeUniform = noiseFx.uniforms?.get('uTime') as THREE.Uniform<number> | null;
    }

    const resize = () => {
      const w = container.clientWidth || 1;
      const h = container.clientHeight || 1;
      renderer.setSize(w, h, false);
      uniforms.uResolution.value.set(renderer.domElement.width, renderer.domElement.height);
      uniforms.uPixelSize.value = pixelSize * renderer.getPixelRatio();
      composer?.setSize(renderer.domElement.width, renderer.domElement.height);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    let clickIx = 0;
    const mapToPixelCoords = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      if (
        e.clientX < rect.left ||
        e.clientX > rect.right ||
        e.clientY < rect.top ||
        e.clientY > rect.bottom
      ) {
        return null;
      }
      const sx = renderer.domElement.width / rect.width;
      const sy = renderer.domElement.height / rect.height;
      return {
        x: (e.clientX - rect.left) * sx,
        y: (rect.height - (e.clientY - rect.top)) * sy,
      };
    };
    const onPointerDown = (e: PointerEvent) => {
      const p = mapToPixelCoords(e);
      if (!p) return;
      (uniforms.uClickPos.value as THREE.Vector2[])[clickIx].set(p.x, p.y);
      (uniforms.uClickTimes.value as Float32Array)[clickIx] = uniforms.uTime.value;
      clickIx = (clickIx + 1) % MAX_CLICKS;
    };
    window.addEventListener('pointerdown', onPointerDown, { passive: true });

    const clock = new THREE.Clock();
    let raf = 0;
    const loop = () => {
      uniforms.uTime.value = clock.getElapsedTime() * speed;
      if (composer) {
        if (noiseTimeUniform) noiseTimeUniform.value = uniforms.uTime.value;
        composer.render();
      } else {
        renderer.render(scene, camera);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('pointerdown', onPointerDown);
      quad.geometry.dispose();
      material.dispose();
      composer?.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      if (renderer.domElement.parentElement === container) container.removeChild(renderer.domElement);
    };
  }, [
    color,
    edgeFade,
    enableRipples,
    intensity,
    noiseAmount,
    patternDensity,
    patternScale,
    pixelSize,
    pixelSizeJitter,
    rippleIntensityScale,
    rippleSpeed,
    rippleThickness,
    speed,
    transparent,
    variant,
  ]);

  return (
    <div
      ref={containerRef}
      className={`w-full h-full relative overflow-hidden ${className ?? ''}`}
      style={style}
      aria-label="PixelBlast interactive background"
    />
  );
}

export default PixelBlast;
