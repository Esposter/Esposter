import type { PhaserEvents } from "@/services/phaser/events";
import { phaserEventEmitter } from "@/services/phaser/events";
import type { EventEmitter } from "eventemitter3";

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
