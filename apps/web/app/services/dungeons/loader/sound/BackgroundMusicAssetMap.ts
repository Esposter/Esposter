import andTheJourneyBegins from "#src/assets/dungeons/thirdParty/xDeviruchi/andTheJourneyBegins.wav";
import decisiveBattle from "#src/assets/dungeons/thirdParty/xDeviruchi/decisiveBattle.wav";
import titleTheme from "#src/assets/dungeons/thirdParty/xDeviruchi/titleTheme.wav";
import { BackgroundMusicKey } from "#src/models/dungeons/keys/sound/BackgroundMusicKey";

export const BackgroundMusicAssetMap = {
  [BackgroundMusicKey.AndTheJourneyBegins]: andTheJourneyBegins,
  [BackgroundMusicKey.DecisiveBattle]: decisiveBattle,
  [BackgroundMusicKey.Title]: titleTheme,
} as const satisfies Record<BackgroundMusicKey, string>;
