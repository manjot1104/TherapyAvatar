"use client";
import React, { useEffect, useState } from "react";

type Props = { attentionScore: number };

const starCount = 5;

export default function EngagementGauge({ attentionScore }: Props) {
  const [score, setScore] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const duration = 300;
    const initial = score;
    const animate = (t: number) => {
      const progress = Math.min((t - start) / duration, 1);
      setScore(initial + (attentionScore - initial) * progress);
      if (progress < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [attentionScore]);

  const activeStars = Math.round(score * starCount);

  return (
    <div className="p-4 bg-white/95 rounded-2xl shadow-lg border-4 border-yellow-300 w-full max-w-sm mx-auto">
      <h2 className="text-xl font-bold text-yellow-700 mb-2 text-center">🌟 Attention Meter</h2>
      <div className="flex justify-center items-center space-x-2 mb-2">
        {Array.from({ length: starCount }).map((_, i) => (
          <span key={i} className={`text-2xl transition-colors ${i < activeStars ? "text-yellow-400 animate-pulse" : "text-yellow-200"}`}>★</span>
        ))}
      </div>
      <div className="relative h-6 bg-yellow-100 rounded-full mt-2 overflow-hidden">
        <div className="absolute top-0 left-0 h-6 bg-yellow-400 rounded-full flex items-center justify-end pr-2 transition-all" style={{ width: `${Math.round(score * 100)}%` }}>
          <span className="text-sm animate-bounce">🚀</span>
        </div>
      </div>
      <p className="text-center text-sm text-yellow-700 mt-2">{Math.round(score * 100)}% Focused</p>
    </div>
  );
}
