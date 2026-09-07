import type { Loader } from "phaser";
import type { SceneWithPlugins } from "vue-phaserjs";

import andTheJourneyBegins from "@/assets/dungeons/thirdParty/xDeviruchi/andTheJourneyBegins.wav";
import decisiveBattle from "@/assets/dungeons/thirdParty/xDeviruchi/decisiveBattle.wav";
import titleTheme from "@/assets/dungeons/thirdParty/xDeviruchi/titleTheme.wav";
import { BackgroundMusicKey } from "@/models/dungeons/keys/sound/BackgroundMusicKey";

export const BackgroundMusicLoaderMap: Record<BackgroundMusicKey, (scene: SceneWithPlugins) => Loader.LoaderPlugin> = {
  [BackgroundMusicKey.AndTheJourneyBegins]: (scene) =>
    scene.load.audio(BackgroundMusicKey.AndTheJourneyBegins, andTheJourneyBegins),
  [BackgroundMusicKey.DecisiveBattle]: (scene) => scene.load.audio(BackgroundMusicKey.DecisiveBattle, decisiveBattle),
  [BackgroundMusicKey.Title]: (scene) => scene.load.audio(BackgroundMusicKey.Title, titleTheme),
};
