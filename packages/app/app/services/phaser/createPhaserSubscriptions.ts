import type { PhaserEvents } from "@/services/phaser/events";
import type { EventEmitter } from "eventemitter3";

import { phaserEventEmitter } from "@/services/phaser/events";

export interface PhaserSubscriptions {
  subscribe: <TEvent extends EventEmitter.EventNames<PhaserEvents>>(
    event: TEvent,
    listener: EventEmitter.EventListener<PhaserEvents, TEvent>,
  ) => void;
  unsubscribeAll: () => void;
}
// A battle state listens while it is entered and drops every listener on exit, so the unsubscribes are held per
// Registry rather than in one module-level list every state that does this would otherwise share — two states
// Subscribing at once would then clear each other's listeners on whichever exits first
export const createPhaserSubscriptions = (): PhaserSubscriptions => {
  let unsubscribes: (() => void)[] = [];
  return {
    subscribe: (event, listener) => {
      phaserEventEmitter.on(event, listener);
      unsubscribes.push(() => {
        phaserEventEmitter.off(event, listener);
      });
    },
    unsubscribeAll: () => {
      for (const unsubscribe of unsubscribes) unsubscribe();
      unsubscribes = [];
    },
  };
};
