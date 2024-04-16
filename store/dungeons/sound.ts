import { usePhaserStore } from "@/lib/phaser/store/phaser";
import type { SoundKey } from "@/models/dungeons/keys/sound/SoundKey";

export const useSoundStore = defineStore("dungeons/sound", () => {
  const phaserStore = usePhaserStore();
  const { scene } = storeToRefs(phaserStore);
  const backgroundMusicKey = ref<SoundKey>();

  watch(backgroundMusicKey, (newBackgroundMusicKey, oldBackgroundMusicKey) => {
    const allPlayingSounds = scene.value.sound.getAllPlaying();
    if (oldBackgroundMusicKey) scene.value.sound.stopByKey(oldBackgroundMusicKey);
    if (!newBackgroundMusicKey || allPlayingSounds.some((s) => s.key === newBackgroundMusicKey)) return;

    const { play } = useDungeonsSound(newBackgroundMusicKey, { loop: true });
    play();
  });

  return { backgroundMusicKey };
});
