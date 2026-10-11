import type { PhaserEvents } from "@/models/phaser/PhaserEvents";

export interface PhaserSubscriptions {
  subscribe: <TEvent extends keyof PhaserEvents>(event: TEvent, listener: PhaserEvents[TEvent]) => void;
  unsubscribeAll: () => void;
}
