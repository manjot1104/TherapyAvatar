// server/src/types/ws-augment.d.ts
import "ws";

declare module "ws" {
  interface WebSocket {
    isAlive?: boolean;
  }
}
