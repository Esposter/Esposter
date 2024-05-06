import { onShutdown } from "@/lib/phaser/hooks/onShutdown";
import type { BackgroundMusicKey } from "@/models/dungeons/keys/sound/BackgroundMusicKey";
import { useSoundStore } from "@/store/dungeons/sound";

export const useDungeonsBackgroundMusic = (key: BackgroundMusicKey) => {
  const soundStore = useSoundStore();
  const { backgroundMusicKey } = storeToRefs(soundStore);
  backgroundMusicKey.value = key;

  onShutdown(() => {
    backgroundMusicKey.value = undefined;
  });
};
