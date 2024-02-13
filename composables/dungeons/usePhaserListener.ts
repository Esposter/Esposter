import { phaserEventEmitter, type PhaserEvents } from "@/lib/phaser/events/phaser";

export const usePhaserListener = <TKey extends keyof PhaserEvents>(event: TKey, listener: PhaserEvents[TKey]) => {
  onMounted(() => {
    phaserEventEmitter.on(event, listener);
  });

  onUnmounted(() => {
    phaserEventEmitter.off(event, listener);
  });
};
