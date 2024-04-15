import { onStopped } from "@/lib/phaser/hooks/onStopped";
import type { SoundKey } from "@/models/dungeons/keys/SoundKey";
import { useSoundStore } from "@/store/dungeons/sound";

export const useDungeonsBackgroundMusic = (soundKey: SoundKey) => {
  const soundStore = useSoundStore();
  const { backgroundMusicSoundKey } = storeToRefs(soundStore);

  backgroundMusicSoundKey.value = soundKey;

  onStopped(() => {
    backgroundMusicSoundKey.value = undefined;
  });
};
