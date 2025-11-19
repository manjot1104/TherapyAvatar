// // src/app/(protected)/therapy/engagement/page.tsx
// "use client";

// import React, { Suspense } from "react";
// import dynamic from "next/dynamic";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import EngagementGauge from "@/components/EmotionEngagementGauge";
// import useGazeWS from "@/hooks/useGazeWS";

// const EmotionTracker = dynamic(() => import("@/components/EmotionTracker"), { ssr: false });

// export default function EngagementPage() {
//   const metrics = useGazeWS();

//   return (
//     <section className="grid gap-6">
//       <Card className="bg-card/90 border-border">
//         <CardHeader className="pb-2">
//           <CardTitle className="text-primary">💡 Engagement Meter</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <EngagementGauge attentionScore={metrics?.engagementScore ?? metrics?.attention ?? 0} />
//           <p className="text-xs md:text-sm text-muted-foreground mt-1">
//             Blink: {metrics?.blink?.toFixed(2) ?? "—"} • Attention: {metrics?.attention?.toFixed(2) ?? "—"}
//           </p>
//         </CardContent>
//       </Card>

//       <Card className="bg-card/90 border-border">
//         <CardHeader className="pb-2">
//           <CardTitle className="text-primary">🎥 Live Emotion Camera</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="max-w-sm">
//             <Suspense fallback={<div className="text-sm text-muted-foreground">Starting camera…</div>}>
//               <EmotionTracker />
//             </Suspense>
//           </div>
//         </CardContent>
//       </Card>
//     </section>
//   );
// }
