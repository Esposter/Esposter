import type { AssetLoader } from "#src/models/dungeons/loader/AssetLoader";

import andTheJourneyBegins from "#src/assets/dungeons/thirdParty/xDeviruchi/andTheJourneyBegins.wav";
import decisiveBattle from "#src/assets/dungeons/thirdParty/xDeviruchi/decisiveBattle.wav";
import titleTheme from "#src/assets/dungeons/thirdParty/xDeviruchi/titleTheme.wav";
import { BackgroundMusicKey } from "#src/models/dungeons/keys/sound/BackgroundMusicKey";

export const BackgroundMusicLoaderMap = {
  [BackgroundMusicKey.AndTheJourneyBegins]: (scene) =>
    scene.load.audio(BackgroundMusicKey.AndTheJourneyBegins, andTheJourneyBegins),
  [BackgroundMusicKey.DecisiveBattle]: (scene) => scene.load.audio(BackgroundMusicKey.DecisiveBattle, decisiveBattle),
  [BackgroundMusicKey.Title]: (scene) => scene.load.audio(BackgroundMusicKey.Title, titleTheme),
} as const satisfies Record<BackgroundMusicKey, AssetLoader>;
