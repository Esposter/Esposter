import type { Loader } from "phaser";
import type { SceneWithPlugins } from "vue-phaserjs";

import openChest from "@/assets/dungeons/sound/openChest.mp3";
import openDoor from "@/assets/dungeons/sound/openDoor.mp3";
import textBlip from "@/assets/dungeons/sound/textBlip.mp3";
import claw from "@/assets/dungeons/thirdParty/leohpaz/claw.wav";
import flee from "@/assets/dungeons/thirdParty/leohpaz/flee.wav";
import iceExplosion from "@/assets/dungeons/thirdParty/leohpaz/iceExplosion.wav";
import stepGrass from "@/assets/dungeons/thirdParty/leohpaz/stepGrass.wav";
import { SoundEffectKey } from "@/models/dungeons/keys/sound/SoundEffectKey";

export const SoundEffectLoaderMap: Record<SoundEffectKey, (scene: SceneWithPlugins) => Loader.LoaderPlugin> = {
  [SoundEffectKey.Claw]: (scene) => scene.load.audio(SoundEffectKey.Claw, claw),
  [SoundEffectKey.Flee]: (scene) => scene.load.audio(SoundEffectKey.Flee, flee),
  [SoundEffectKey.IceExplosion]: (scene) => scene.load.audio(SoundEffectKey.IceExplosion, iceExplosion),
  [SoundEffectKey.OpenChest]: (scene) => scene.load.audio(SoundEffectKey.OpenChest, openChest),

  [SoundEffectKey.OpenDoor]: (scene) => scene.load.audio(SoundEffectKey.OpenDoor, openDoor),
  [SoundEffectKey.StepGrass]: (scene) => scene.load.audio(SoundEffectKey.StepGrass, stepGrass),
  [SoundEffectKey.TextBlip]: (scene) => scene.load.audio(SoundEffectKey.TextBlip, textBlip),
};
