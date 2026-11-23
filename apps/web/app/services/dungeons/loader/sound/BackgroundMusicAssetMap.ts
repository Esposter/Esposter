import andTheJourneyBegins from "#src/assets/dungeons/thirdParty/xDeviruchi/andTheJourneyBegins.mp3";
import decisiveBattle from "#src/assets/dungeons/thirdParty/xDeviruchi/decisiveBattle.mp3";
import titleTheme from "#src/assets/dungeons/thirdParty/xDeviruchi/titleTheme.mp3";
import { BackgroundMusicKey } from "#src/models/dungeons/keys/sound/BackgroundMusicKey";

export const BackgroundMusicAssetMap = {
  [BackgroundMusicKey.AndTheJourneyBegins]: andTheJourneyBegins,
  [BackgroundMusicKey.DecisiveBattle]: decisiveBattle,
  [BackgroundMusicKey.Title]: titleTheme,
} as const satisfies Record<BackgroundMusicKey, string>;
