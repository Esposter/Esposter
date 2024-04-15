import textBlip from "@/assets/dungeons/sound/textBlip.mp3";
import claw from "@/assets/dungeons/thirdParty/leohpaz/claw.wav";
import flee from "@/assets/dungeons/thirdParty/leohpaz/flee.wav";
import iceExplosion from "@/assets/dungeons/thirdParty/leohpaz/iceExplosion.wav";
import stepGrass from "@/assets/dungeons/thirdParty/leohpaz/stepGrass.wav";
import andTheJourneyBegins from "@/assets/dungeons/thirdParty/xDeviruchi/andTheJourneyBegins.wav";
import decisiveBattle from "@/assets/dungeons/thirdParty/xDeviruchi/decisiveBattle.wav";
import titleTheme from "@/assets/dungeons/thirdParty/xDeviruchi/titleTheme.wav";
import { SoundKey } from "@/models/dungeons/keys/SoundKey";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import type { Loader } from "phaser";

export const SoundLoaderMap: Record<SoundKey, (scene: SceneWithPlugins) => Loader.LoaderPlugin> = {
  [SoundKey.AndTheJourneyBegins]: (scene) => scene.load.audio(SoundKey.AndTheJourneyBegins, andTheJourneyBegins),
  [SoundKey.DecisiveBattle]: (scene) => scene.load.audio(SoundKey.DecisiveBattle, decisiveBattle),
  [SoundKey.TitleTheme]: (scene) => scene.load.audio(SoundKey.TitleTheme, titleTheme),

  [SoundKey.Claw]: (scene) => scene.load.audio(SoundKey.Claw, claw),
  [SoundKey.Flee]: (scene) => scene.load.audio(SoundKey.Flee, flee),
  [SoundKey.IceExplosion]: (scene) => scene.load.audio(SoundKey.IceExplosion, iceExplosion),
  [SoundKey.StepGrass]: (scene) => scene.load.audio(SoundKey.StepGrass, stepGrass),

  [SoundKey.TextBlip]: (scene) => scene.load.audio(SoundKey.TextBlip, textBlip),
};
