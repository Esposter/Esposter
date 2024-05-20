import type { SoundKey } from "@/models/dungeons/keys/sound/SoundKey";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import type { Types } from "phaser";

export const getDungeonsSound = (scene: SceneWithPlugins, soundKey: SoundKey, options?: Types.Sound.SoundConfig) => ({
  play: () => {
    scene.sound.play(soundKey, { ...options, volume: options?.volume ?? 1 });
  },
  stop: () => {
    scene.sound.stopByKey(soundKey);
  },
});
