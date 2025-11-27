// src/lib/avatar-control.ts

let avatarApi: null | {
  setWeight?: (name: string, value: number) => void;
  setExpression?: (name: string, value: number) => void;
  playGesture?: (name: string) => void;
} = null;

export function registerAvatar(api: typeof avatarApi) {
  avatarApi = api;
  (window as any).__AVATAR__ = api; // agar tu pehle se use kar raha hai to yeh bhi theek hai
}

export function avatarSetExpression(mood: "neutral" | "happy" | "sad" | "angry") {
  if (!avatarApi?.setExpression) return;

  // sab zero karo pehle
  avatarApi.setExpression("happy", 0);
  avatarApi.setExpression("sad", 0);
  avatarApi.setExpression("angry", 0);

  if (mood !== "neutral") {
    avatarApi.setExpression(mood, 1);
  }
}

export function avatarTalkStart() {
  avatarApi?.playGesture?.("talk");
}

export function avatarTalkStop() {
  avatarApi?.playGesture?.("idle");
}

export function avatarCelebrate() {
  avatarApi?.playGesture?.("celebrate");
  avatarSetExpression("happy");
}

export function avatarDisappointed() {
  avatarApi?.playGesture?.("idle");
  avatarSetExpression("sad");
}

export function avatarPoint() {
  avatarApi?.playGesture?.("point");
}

export function avatarWave() {
  avatarApi?.playGesture?.("wave");
}

export function avatarOpenHands() {
  avatarApi?.playGesture?.("open_hands");
}

export function avatarThink() {
  avatarApi?.playGesture?.("think");
}
