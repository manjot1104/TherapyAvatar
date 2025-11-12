"use client";

import dynamic from "next/dynamic";
import React from "react";

const TherapistAvatar = dynamic(() => import("./TherapistAvatar.tsx"), { ssr: false });

export default function Page() {
  return (
    <div style={{ height: "100vh", width: "100vw", background: "#0b1020", color: "white" }}>
      <TherapistAvatar vrmUrl="/avatar/therapist.vrm" motionUrl="/anim/therapist_gestures.glb" />
    </div>
  );
}
