import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { SoundSetting } from "@/models/dungeons/data/settings/SoundSetting";
import type { BackgroundMusicKey } from "@/models/dungeons/keys/sound/BackgroundMusicKey";
import { useSettingsStore } from "@/store/dungeons/settings";

export const useSoundStore = defineStore("dungeons/sound", () => {
  const phaserStore = usePhaserStore();
  const { scene } = storeToRefs(phaserStore);
  const settingsStore = useSettingsStore();
  const { settings } = storeToRefs(settingsStore);
  watch([scene, () => settings.value.Sound], ([newScene, newSoundSetting]) => {
    newScene.sound.setMute(newSoundSetting === SoundSetting.Off);
  });

  const backgroundMusicKey = ref<BackgroundMusicKey>();
  watch(backgroundMusicKey, (newBackgroundMusicKey, oldBackgroundMusicKey) => {
    const allPlayingSounds = scene.value.sound.getAllPlaying();
    if (oldBackgroundMusicKey) scene.value.sound.stopByKey(oldBackgroundMusicKey);
    if (!newBackgroundMusicKey || allPlayingSounds.some((s) => s.key === newBackgroundMusicKey)) return;

    const { play } = useDungeonsSound(newBackgroundMusicKey, { loop: true });
    play();
  });

  return { backgroundMusicKey };
});
