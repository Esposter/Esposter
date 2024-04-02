import textBlip from "@/assets/dungeons/sound/textBlip.mp3";
import { SoundKey } from "@/models/dungeons/keys/SoundKey";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import type { Loader } from "phaser";

export const SoundLoaderMap: Record<SoundKey, (scene: SceneWithPlugins) => Loader.LoaderPlugin> = {
  [SoundKey.TextBlip]: (scene) => scene.load.audio(SoundKey.TextBlip, textBlip),
};
