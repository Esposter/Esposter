import { usePhaserStore } from "@/lib/phaser/store/phaser";
import type { SoundKey } from "@/models/dungeons/keys/SoundKey";
import { useVolumeStore } from "@/store/dungeons/settings/volume";
import type { Except } from "@/util/types/Except";
import type { Types } from "phaser";

export const useDungeonsSound = (soundKey: SoundKey, options?: Except<Types.Sound.SoundConfig, "volume">) => {
  const phaserStore = usePhaserStore();
  const { scene } = storeToRefs(phaserStore);
  const volumeStore = useVolumeStore();
  const { volume: baseVolume } = storeToRefs(volumeStore);
  const volume = computed(() => baseVolume.value / 100);
  scene.value.sound.play(soundKey, { ...options, volume: volume.value });

  watch(volume, (newVolume) => {
    scene.value.sound.setVolume(newVolume);
  });

  return {
    play: () => scene.value.sound.play(soundKey, { ...options, volume: volume.value }),
    stop: () => scene.value.sound.stopByKey(soundKey),
  };
};
