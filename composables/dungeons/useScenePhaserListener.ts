import type { PhaserEvents } from "@/lib/phaser/events/phaser";
import { phaserEventEmitter } from "@/lib/phaser/events/phaser";
import { usePhaserStore } from "@/lib/phaser/store/phaser";
import type { EventEmitter } from "eventemitter3";
import { Scenes } from "phaser";
// This is mainly used inside phaser lifecycle hooks where it is not a part of vue
export const useScenePhaserListener = <TEvent extends EventEmitter.EventNames<PhaserEvents>>(
  event: TEvent,
  listener: EventEmitter.EventListener<PhaserEvents, TEvent>,
) => {
  const phaserStore = usePhaserStore();
  const { scene } = storeToRefs(phaserStore);

  scene.value.events.once(Scenes.Events.CREATE, () => {
    phaserEventEmitter.on(event, listener);
  });

  scene.value.events.once(Scenes.Events.SLEEP, () => {
    phaserEventEmitter.off(event, listener);
  });
};
