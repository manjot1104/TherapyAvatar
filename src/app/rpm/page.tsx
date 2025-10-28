// src/app/rpm/page.tsx
"use client";
import React, { useEffect, useState } from "react";

export default function RPMGrab() {
  const [url, setUrl] = useState("");
  const [id, setId] = useState("");

  useEffect(() => {
    function onMsg(event: MessageEvent) {
      const data = event.data;
      if (!data || typeof data !== "object") return;

      if (data.source === "readyplayerme" && data.eventName === "v1.frame.ready") {
        // subscribe to exported event
        (document.getElementById("rpm") as HTMLIFrameElement)?.contentWindow?.postMessage(
          JSON.stringify({ target: "readyplayerme", type: "subscribe", eventName: "v1.avatar.exported" }),
          "*"
        );
      }

      if (data.source === "readyplayerme" && data.eventName === "v1.avatar.exported") {
        const glb: string = data?.data?.avatar?.url || "";
        setUrl(glb);
        // avatarId = path segment between /models.readyplayer.me/ and .glb
        const m = glb.match(/models\.readyplayer\.me\/([^/?]+)\.glb/i);
        setId(m?.[1] || "");
      }
    }
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, []);

  return (
    <div className="p-4 space-y-3">
      <h1 className="text-lg font-semibold">Create your RPM avatar</h1>
      <iframe
        id="rpm"
        title="rpm"
        src="https://demo.readyplayer.me/avatar?frameApi"
        style={{ width: "100%", height: 650, border: 0, borderRadius: 12 }}
        allow="camera *; microphone *; clipboard-write"
      />
      <div className="p-3 bg-slate-100 rounded text-sm">
        <div><b>GLB URL:</b> {url || "(Export an avatar to see URL here)"} </div>
        <div><b>Avatar ID:</b> {id || "(will appear after export)"} </div>
      </div>
    </div>
  );
}
