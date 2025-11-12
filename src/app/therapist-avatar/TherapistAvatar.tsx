"use client";

import React from "react";

type Props = {
  vrmUrl?: string;
  motionUrl?: string;
};

export default function TherapistAvatar({ vrmUrl, motionUrl }: Props) {
  // minimal stub so the build succeeds; wire up 3D later
  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "grid",
        placeItems: "center",
        border: "1px dashed rgba(255,255,255,0.2)",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 20, marginBottom: 8 }}>Therapist Avatar</div>
        <div style={{ opacity: 0.8, fontSize: 14 }}>
          <div><strong>vrmUrl</strong>: {vrmUrl || "(none)"} </div>
          <div><strong>motionUrl</strong>: {motionUrl || "(none)"} </div>
        </div>
      </div>
    </div>
  );
}
