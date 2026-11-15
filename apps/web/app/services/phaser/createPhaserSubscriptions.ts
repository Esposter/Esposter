import type { PhaserSubscriptions } from "#src/models/phaser/PhaserSubscriptions";

import { phaserEventEmitter } from "#src/services/phaser/phaserEventEmitter";

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
