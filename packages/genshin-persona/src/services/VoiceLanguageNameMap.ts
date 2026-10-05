import { GameLanguage } from "#src/generated/genshinText/models/GameLanguage";
import { VoiceLanguage } from "#src/models/VoiceLanguage";

// The one thing the interface language says about the voice: whether a dub of it exists at all. Four of the fifteen
// Have one
export const VoiceLanguageNameMap: Record<VoiceLanguage, GameLanguage> = {
  [VoiceLanguage.Chinese]: GameLanguage.ChineseSimplified,
  [VoiceLanguage.English]: GameLanguage.English,
  [VoiceLanguage.Japanese]: GameLanguage.Japanese,
  [VoiceLanguage.Korean]: GameLanguage.Korean,
};
