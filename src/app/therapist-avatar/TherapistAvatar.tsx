"use client";
import React from "react";

type Props = { vrmUrl?: string; motionUrl?: string };

export default function TherapistAvatar({ vrmUrl, motionUrl }: Props) {
  return (
    <div style={{ height: "100%", width: "100%", display: "grid", placeItems: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 20, marginBottom: 8 }}>Therapist Avatar</div>
        <div style={{ opacity: 0.8, fontSize: 14 }}>
          <div><b>vrmUrl</b>: {vrmUrl || "(none)"} </div>
          <div><b>motionUrl</b>: {motionUrl || "(none)"} </div>
        </div>
      </div>
    </div>
  );
}
