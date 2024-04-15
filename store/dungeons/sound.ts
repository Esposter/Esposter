import { usePhaserStore } from "@/lib/phaser/store/phaser";
import type { SoundKey } from "@/models/dungeons/keys/SoundKey";

export const useSoundStore = defineStore("dungeons/sound", () => {
  const phaserStore = usePhaserStore();
  const { scene } = storeToRefs(phaserStore);
  const backgroundMusicSoundKey = ref<SoundKey>();

  watch(backgroundMusicSoundKey, (newBackgroundMusicSoundKey, oldBackgroundMusicSoundKey) => {
    const allPlayingSounds = scene.value.sound.getAllPlaying();
    if (oldBackgroundMusicSoundKey) scene.value.sound.stopByKey(oldBackgroundMusicSoundKey);
    if (!newBackgroundMusicSoundKey || allPlayingSounds.some((s) => s.key === newBackgroundMusicSoundKey)) return;

    const { play } = useDungeonsSound(newBackgroundMusicSoundKey, { loop: true });
    play();
  });

  return { backgroundMusicSoundKey };
});
