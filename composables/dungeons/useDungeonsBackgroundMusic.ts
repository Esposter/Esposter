import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { BEFORE_STOP_SCENE_EVENT_KEY } from "@/lib/phaser/util/constants";
import type { SoundKey } from "@/models/dungeons/keys/SoundKey";
import { useSoundStore } from "@/store/dungeons/sound";

export const useDungeonsBackgroundMusic = (soundKey: SoundKey) => {
  const phaserStore = usePhaserStore();
  const { sceneKey } = storeToRefs(phaserStore);
  const soundStore = useSoundStore();
  const { backgroundMusicSoundKey } = storeToRefs(soundStore);

  backgroundMusicSoundKey.value = soundKey;

  useScenePhaserListener(`${BEFORE_STOP_SCENE_EVENT_KEY}${sceneKey.value}`, () => {
    backgroundMusicSoundKey.value = undefined;
  });
};
