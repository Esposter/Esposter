import type { PhaserEvents } from "@/models/phaser/PhaserEvents";

import { phaserEventEmitter } from "@/services/phaser/phaserEventEmitter";

export const usePhaserListener = <TEvent extends keyof PhaserEvents>(event: TEvent, listener: PhaserEvents[TEvent]) => {
  onMounted(() => {
    phaserEventEmitter.on(event, listener);
  });

  onUnmounted(() => {
    phaserEventEmitter.off(event, listener);
  });
};
