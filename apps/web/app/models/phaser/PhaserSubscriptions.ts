import type { PhaserEvents } from "@/models/phaser/PhaserEvents";
import type { EventEmitter } from "eventemitter3";

export interface PhaserSubscriptions {
  subscribe: <TEvent extends EventEmitter.EventNames<PhaserEvents>>(
    event: TEvent,
    listener: EventEmitter.EventListener<PhaserEvents, TEvent>,
  ) => void;
  unsubscribeAll: () => void;
}
