// src/components/AvatarCanvas.tsx
"use client";

import React, { Suspense, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Environment } from "@react-three/drei";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { MeshoptDecoder } from "three-stdlib";

type VisemeKey = string;

const PITCH_UP = -0.18;

type Vec3 = { x: number; y: number; z: number };
type FingerBone = {
  bone: THREE.Object3D;
  base: Vec3;
};

function deg(d: number) {
  return THREE.MathUtils.degToRad(d);
}

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

  // ------ mouth / viseme setup ------
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
        if (evt.key === last.key && evt.time - last.time < MIN_GAP) {
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
        [
          "jawOpen",
          "mouthOpen",
          "mouthFunnel",
          "viseme_aa",
          "viseme_E",
          "viseme_U",
          "viseme_O",
          "mouthAa",
        ].find((k) => morphTargets.current[k]) || Object.keys(morphTargets.current)[0];
      if (!pick) return;
      setWeight(pick, 0.9);
      setTimeout(() => decayAll(0.3), 120);
    };

    const _has = (key: string) => Boolean(morphTargets.current[key]);

    onReady({ setWeight, decayAll, playVisemes, pulseWord, _has });
  }, [scene, onReady]);

  // ------ skeleton: arms + fingers ------

  const bonesRef = useRef<{
    rUpper?: THREE.Object3D;
    rLower?: THREE.Object3D;
    rHand?: THREE.Object3D;
    lUpper?: THREE.Object3D;
    lLower?: THREE.Object3D;
    lHand?: THREE.Object3D;
  }>({});

  const baseRotRef = useRef<{
    rUpper?: Vec3;
    rLower?: Vec3;
    rHand?: Vec3;
    lUpper?: Vec3;
    lLower?: Vec3;
    lHand?: Vec3;
  }>({});

  const rightFingers = useRef<FingerBone[]>([]);
  const leftFingers = useRef<FingerBone[]>([]);

  useEffect(() => {
    scene.traverse((obj) => {
      const mesh = obj as any;
      if (!(mesh as any).isBone) return;

      const name: string = mesh.name || "";
      const n = name.toLowerCase();

      const isRightUpper =
        n.includes("rightarm") ||
        n.includes("right_upperarm") ||
        n.includes("rightupperarm") ||
        n.includes("rightshoulder") ||
        n.includes("shoulder_r") ||
        n.includes("upperarm_r") ||
        n.includes("r_upperarm");

      const isRightLower =
        n.includes("rightforearm") ||
        n.includes("right_lowerarm") ||
        n.includes("rightlowerarm") ||
        n.includes("rightelbow") ||
        n.includes("r_forearm") ||
        n.includes("forearm_r");

      const isRightHand =
        n.includes("righthand") ||
        n.includes("hand_r") ||
        n.includes("r_hand") ||
        n.includes("rightwrist") ||
        n.includes("wrist_r");

      const isLeftUpper =
        n.includes("leftarm") ||
        n.includes("left_upperarm") ||
        n.includes("leftupperarm") ||
        n.includes("leftshoulder") ||
        n.includes("shoulder_l") ||
        n.includes("upperarm_l") ||
        n.includes("l_upperarm");

      const isLeftLower =
        n.includes("leftforearm") ||
        n.includes("left_lowerarm") ||
        n.includes("leftlowerarm") ||
        n.includes("leftelbow") ||
        n.includes("l_forearm") ||
        n.includes("forearm_l");

      const isLeftHand =
        n.includes("lefthand") ||
        n.includes("hand_l") ||
        n.includes("l_hand") ||
        n.includes("leftwrist") ||
        n.includes("wrist_l");

      if (isRightUpper && !bonesRef.current.rUpper) {
        bonesRef.current.rUpper = mesh;
        baseRotRef.current.rUpper = {
          x: mesh.rotation.x,
          y: mesh.rotation.y,
          z: mesh.rotation.z,
        };
      }
      if (isRightLower && !bonesRef.current.rLower) {
        bonesRef.current.rLower = mesh;
        baseRotRef.current.rLower = {
          x: mesh.rotation.x,
          y: mesh.rotation.y,
          z: mesh.rotation.z,
        };
      }
      if (isRightHand && !bonesRef.current.rHand) {
        bonesRef.current.rHand = mesh;
        baseRotRef.current.rHand = {
          x: mesh.rotation.x,
          y: mesh.rotation.y,
          z: mesh.rotation.z,
        };
      }

      if (isLeftUpper && !bonesRef.current.lUpper) {
        bonesRef.current.lUpper = mesh;
        baseRotRef.current.lUpper = {
          x: mesh.rotation.x,
          y: mesh.rotation.y,
          z: mesh.rotation.z,
        };
      }
      if (isLeftLower && !bonesRef.current.lLower) {
        bonesRef.current.lLower = mesh;
        baseRotRef.current.lLower = {
          x: mesh.rotation.x,
          y: mesh.rotation.y,
          z: mesh.rotation.z,
        };
      }
      if (isLeftHand && !bonesRef.current.lHand) {
        bonesRef.current.lHand = mesh;
        baseRotRef.current.lHand = {
          x: mesh.rotation.x,
          y: mesh.rotation.y,
          z: mesh.rotation.z,
        };
      }

      // finger detection
      const looksLikeFinger =
        n.includes("finger") ||
        n.includes("thumb") ||
        n.includes("index") ||
        n.includes("middle") ||
        n.includes("ring") ||
        n.includes("pinky") ||
        n.includes("little");

      if (looksLikeFinger) {
        const base: Vec3 = {
          x: mesh.rotation.x,
          y: mesh.rotation.y,
          z: mesh.rotation.z,
        };
        const node: FingerBone = { bone: mesh, base };

        if (n.includes("right") || n.includes("r_")) {
          rightFingers.current.push(node);
        } else if (n.includes("left") || n.includes("l_")) {
          leftFingers.current.push(node);
        }
      }
    });
  }, [scene]);

  const root = useRef<THREE.Object3D>(null);
  const timeRef = useRef(0);
  const talkFactorRef = useRef(0); // 0 = idle, 1 = full talking

  // For natural movements: add randomness and varied patterns
  const idleOffsetRef = useRef({
    armPhase: Math.random() * Math.PI * 2,
    fingerPhase: Math.random() * Math.PI * 2,
    gestureTimer: 0,
    lastGesture: 0,
  });

  useEffect(() => {
    if (root.current) {
      root.current.rotation.set(PITCH_UP, 0, 0);
    }
  }, []);

  useFrame((_, dt) => {
    timeRef.current += dt;

    // Blink
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

    // Speech state
    let isTalking = false;
    if (typeof window !== "undefined" && (window as any).speechSynthesis) {
      isTalking = (window as any).speechSynthesis.speaking;
    }

    // Smooth talk factor
    const targetTalk = isTalking ? 1 : 0;
    const k = Math.min(1, dt * 5);
    talkFactorRef.current += (targetTalk - talkFactorRef.current) * k;
    const f = talkFactorRef.current;

    const t = timeRef.current;

    const { rUpper, rLower, rHand, lUpper, lLower, lHand } = bonesRef.current;
    const {
      rUpper: bRU,
      rLower: bRL,
      rHand: bRH,
      lUpper: bLU,
      lLower: bLL,
      lHand: bLH,
    } = baseRotRef.current;

    // ------- Natural arm movements: varied, subtle, with idle fidgets -------
    const idleFactor = 1 - f; // More movement when idle

    // Update idle timers
    idleOffsetRef.current.gestureTimer += dt;
    if (idleOffsetRef.current.gestureTimer - idleOffsetRef.current.lastGesture > 3 + Math.random() * 5) {
      idleOffsetRef.current.lastGesture = idleOffsetRef.current.gestureTimer;
      idleOffsetRef.current.armPhase = Math.random() * Math.PI * 2;
      idleOffsetRef.current.fingerPhase = Math.random() * Math.PI * 2;
    }

    // Right arm: very subtle, natural micro-movements
    if (rUpper && bRU) {
      const microBend = deg(0.5 + Math.sin(t * 0.4 + idleOffsetRef.current.armPhase) * 0.8);
      const talkBend = deg(1.5 + Math.sin(t * 0.8) * 1.2) * f;
      const idleSway = deg(Math.sin(t * 0.3 + idleOffsetRef.current.armPhase * 0.5) * 0.6) * idleFactor;
      rUpper.rotation.x = bRU.x + microBend + talkBend;
      rUpper.rotation.z = bRU.z + idleSway;
    }
    if (rLower && bRL) {
      const microBend = deg(0.3 + Math.sin(t * 0.5 + idleOffsetRef.current.armPhase + 0.5) * 0.5);
      const talkBend = deg(2 + Math.sin(t * 0.9 + 0.3) * 0.8) * f;
      rLower.rotation.x = bRL.x + microBend + talkBend;
    }
    if (rHand && bRH) {
      const microTwist = deg(Math.sin(t * 0.35 + idleOffsetRef.current.armPhase * 0.8) * 0.4) * idleFactor;
      const talkTwist = deg(1.2 + Math.sin(t * 1.0 + 0.8) * 0.6) * f;
      rHand.rotation.z = bRH.z + microTwist + talkTwist;
    }

    // Left arm: even subtler, complementary movements
    if (lUpper && bLU) {
      const microBend = deg(0.4 + Math.sin(t * 0.45 + idleOffsetRef.current.armPhase + Math.PI * 0.3) * 0.6);
      const talkBend = deg(1.2 + Math.sin(t * 0.7 + 0.7) * 1.0) * f;
      const idleSway = deg(Math.sin(t * 0.25 + idleOffsetRef.current.armPhase * 0.6) * 0.5) * idleFactor;
      lUpper.rotation.x = bLU.x + microBend + talkBend;
      lUpper.rotation.z = bLU.z + idleSway;
    }
    if (lLower && bLL) {
      const microBend = deg(0.2 + Math.sin(t * 0.55 + idleOffsetRef.current.armPhase + 1.2) * 0.4);
      const talkBend = deg(1.8 + Math.sin(t * 0.85 + 1.1) * 0.7) * f;
      lLower.rotation.x = bLL.x + microBend + talkBend;
    }
    if (lHand && bLH) {
      const microTwist = deg(Math.sin(t * 0.4 + idleOffsetRef.current.armPhase * 0.7) * 0.3) * idleFactor;
      const talkTwist = deg(1.0 + Math.sin(t * 0.95 + 1.5) * 0.5) * f;
      lHand.rotation.z = bLH.z + microTwist + talkTwist;
    }

    // ------- Fingers: subtle curl / relax -------
    const fingerAmpRight = deg(10);
    const fingerAmpLeft = deg(8);

    rightFingers.current.forEach((fb, i) => {
      const phase = i * 0.4;
      const curl = fingerAmpRight * Math.sin(t * 2.0 + phase) * f;
      fb.bone.rotation.x = fb.base.x + curl;
      fb.bone.rotation.y = fb.base.y;
      fb.bone.rotation.z = fb.base.z;
    });

    leftFingers.current.forEach((fb, i) => {
      const phase = i * 0.4 + 0.7;
      const curl = fingerAmpLeft * Math.sin(t * 1.9 + phase) * f;
      fb.bone.rotation.x = fb.base.x + curl;
      fb.bone.rotation.y = fb.base.y;
      fb.bone.rotation.z = fb.base.z;
    });

    // ------- Body: light bob -------
    if (root.current) {
      const baseY = -1.2;
      const amp = 0.008;
      const freq = 1.1;
      const bob = Math.sin(t * freq) * amp * (0.4 + 0.6 * f); // idle me kam, talking me zyada
      root.current.position.y = baseY + bob;
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
    </Canvas>
  );
}
