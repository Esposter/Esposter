import { FileKey } from "#shared/generated/phaser/FileKey";
import andTheJourneyBegins from "#src/assets/dungeons/thirdParty/xDeviruchi/andTheJourneyBegins.mp3";
import decisiveBattle from "#src/assets/dungeons/thirdParty/xDeviruchi/decisiveBattle.mp3";
import titleTheme from "#src/assets/dungeons/thirdParty/xDeviruchi/titleTheme.mp3";

export const BackgroundMusicAssetMap = {
  [FileKey.ThirdPartyXDeviruchiAndTheJourneyBegins]: andTheJourneyBegins,
  [FileKey.ThirdPartyXDeviruchiDecisiveBattle]: decisiveBattle,
  [FileKey.ThirdPartyXDeviruchiTitleTheme]: titleTheme,
} as const satisfies Partial<Record<FileKey, string>>;
