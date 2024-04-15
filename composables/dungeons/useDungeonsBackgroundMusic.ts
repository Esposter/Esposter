import { onShutdown } from "@/lib/phaser/hooks/onShutdown";
import type { SoundKey } from "@/models/dungeons/keys/SoundKey";
import { useSoundStore } from "@/store/dungeons/sound";

export const useDungeonsBackgroundMusic = (soundKey: SoundKey, sceneKey: string) => {
  const soundStore = useSoundStore();
  const { backgroundMusicSoundKey } = storeToRefs(soundStore);

  backgroundMusicSoundKey.value = soundKey;

  onShutdown(() => {
    backgroundMusicSoundKey.value = undefined;
  }, sceneKey);
};
