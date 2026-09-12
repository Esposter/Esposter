import type { PhaserEvents } from "@/models/phaser/PhaserEvents";
import type { EventEmitter } from "eventemitter3";

import { phaserEventEmitter } from "@/services/phaser/phaserEventEmitter";

export const usePhaserListener = <TEvent extends EventEmitter.EventNames<PhaserEvents>>(
  event: TEvent,
  listener: EventEmitter.EventListener<PhaserEvents, TEvent>,
) => {
  onMounted(() => {
    phaserEventEmitter.on(event, listener);
  });

  onUnmounted(() => {
    phaserEventEmitter.off(event, listener);
  });
};
