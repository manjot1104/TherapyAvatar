// src/components/AvatarCanvas.tsx
"use client";

import React, { Suspense, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Environment } from "@react-three/drei";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { MeshoptDecoder } from "three-stdlib";

type VisemeKey = string;

// 👉 yahan se face kitna upar hai control hoga
const PITCH_UP = -0.18; // -0.10 se -0.30 ke beech try kar sakta hai

function AvatarModel({
  url,
  onReady,
}: {
  url: string;
  onReady: (api: {
    setWeight: (key: VisemeKey, v: number) => void;
    decayAll: (rate?: number) => void;
    playVisemes: (timeline: { time: number; key: VisemeKey; value: number }[]) => void;
    pulseWord: () => void;
    _has: (key: string) => boolean;
  }) => void;
}) {
  const { scene } = useGLTF(
    url,
    true,
    true,
    (loader: any) => {
      const draco = new DRACOLoader();
      draco.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.6/");
      loader.setDRACOLoader(draco);
      loader.setMeshoptDecoder?.(MeshoptDecoder);
    }
  );

  const morphTargets = useRef<Record<string, { mesh: any; index: number }>>({});
  const activeWeights = useRef<Record<string, number>>({});

  useEffect(() => {
    scene.traverse((obj) => {
      const mesh = obj as any;
      if (!mesh.morphTargetDictionary || !mesh.morphTargetInfluences) return;
      for (const [key, idx] of Object.entries(mesh.morphTargetDictionary)) {
        morphTargets.current[key] = { mesh, index: idx as number };
        if (!(key in activeWeights.current)) activeWeights.current[key] = 0;
      }
    });

    const setWeight = (key: VisemeKey, v: number) => {
      const mt = morphTargets.current[key];
      if (!mt) return;
      const val = Math.max(0, Math.min(1, v));
      activeWeights.current[key] = val;
      mt.mesh.morphTargetInfluences![mt.index] = val;
    };

    const decayAll = (rate = 0.12) => {
      for (const k of Object.keys(activeWeights.current)) {
        const mt = morphTargets.current[k];
        if (!mt) continue;
        const cur = activeWeights.current[k] ?? 0;
        const next = Math.max(0, cur - rate);
        activeWeights.current[k] = next;
        mt.mesh.morphTargetInfluences![mt.index] = next;
      }
    };

    const playVisemes = (timeline: { time: number; key: VisemeKey; value: number }[]) => {
      for (const k of Object.keys(activeWeights.current)) setWeight(k, 0);
      if (!timeline?.length) return;

      const MIN_GAP = 55;
      const tline: typeof timeline = [];
      for (const evt of timeline) {
        const last = tline[tline.length - 1];
        if (!last) {
          tline.push(evt);
          continue;
        }
        if (evt.key === last.key && (evt.time - last.time) < MIN_GAP) {
          last.value = Math.max(last.value, evt.value);
          last.time = Math.max(last.time, evt.time - 10);
        } else {
          tline.push(evt);
        }
      }

      const START = 60;
      let i = 0;
      const start = performance.now() + START;
      const step = () => {
        const now = performance.now() - start;
        while (i < tline.length && tline[i].time <= now) {
          const evt = tline[i++];
          setWeight(evt.key, evt.value);
          setTimeout(() => decayAll(0.22), 85);
        }
        if (i < tline.length) requestAnimationFrame(step);
        else setTimeout(() => decayAll(0.3), 140);
      };
      requestAnimationFrame(step);
    };

    const pulseWord = () => {
      const pick =
        ["jawOpen","mouthOpen","mouthFunnel","viseme_aa","viseme_E","viseme_U","viseme_O","mouthAa"]
          .find((k) => morphTargets.current[k]) ||
        Object.keys(morphTargets.current)[0];
      if (!pick) return;
      setWeight(pick, 0.9);
      setTimeout(() => decayAll(0.3), 120);
    };

    const _has = (key: string) => Boolean(morphTargets.current[key]);

    onReady({ setWeight, decayAll, playVisemes, pulseWord, _has });
  }, [scene, onReady]);

  const root = useRef<THREE.Object3D>(null);
  const t = useRef(0);

  // 👉 initial pose: face thoda upar + still
  useEffect(() => {
    if (root.current) {
      root.current.rotation.set(PITCH_UP, 0, 0); // x, y, z
    }
  }, []);

  useFrame((_, dt) => {
    t.current += dt;

    // ❌ koi sway / ghoomna nahi, sirf blink
    if (Math.random() < dt * 0.2) {
      const L = morphTargets.current["eyeBlink_L"];
      const R = morphTargets.current["eyeBlink_R"];
      if (L && R) {
        L.mesh.morphTargetInfluences![L.index] = 1;
        R.mesh.morphTargetInfluences![R.index] = 1;
        setTimeout(() => {
          L.mesh.morphTargetInfluences![L.index] = 0;
          R.mesh.morphTargetInfluences![R.index] = 0;
        }, 90);
      }
    }
  });

  return <primitive ref={root} object={scene} position={[0, -1.2, 0]} />;
}

export default function AvatarCanvas({ modelUrl }: { modelUrl: string }) {
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!modelUrl) {
      setErr("Set NEXT_PUBLIC_RPM_URL in .env.local");
      return;
    }
    (async () => {
      try {
        const head = await fetch(modelUrl, { method: "HEAD" });
        if (!head.ok) throw new Error(`${head.status}`);
      } catch (e: any) {
        setErr(`Cannot reach model: ${e?.message ?? e}`);
      }
    })();
  }, [modelUrl]);

  useEffect(() => {
    if (typeof window !== "undefined" && modelUrl) {
      try {
        (useGLTF as any).preload?.(modelUrl);
      } catch {}
    }
  }, [modelUrl]);

  const handleReady = (api: any) => {
    (window as any).__AVATAR__ = { ...(window as any).__AVATAR__, ...api };
  };

  if (!modelUrl || err) {
    return (
      <div className="grid place-items-center w-full h-full min-h-[520px] bg-slate-100 rounded-xl text-slate-600 p-4 text-center">
        {err ?? "Set NEXT_PUBLIC_RPM_URL in .env.local"}
      </div>
    );
  }

  return (
    <Canvas
      shadows
      // 👉 camera bhi thoda niche kiya, taa ki top-down feel kam ho
      camera={{ position: [0, 1.1, 2.1], fov: 38 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      dpr={[1, 2]}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.6} />
        <hemisphereLight intensity={0.4} />
        <directionalLight position={[2, 4, 2]} intensity={1.0} castShadow />
        <AvatarModel url={modelUrl} onReady={handleReady} />
        <Environment preset="city" />
      </Suspense>

      {/* CameraControls deliberately removed => no zoom/rotate/pan */}
    </Canvas>
  );
}
