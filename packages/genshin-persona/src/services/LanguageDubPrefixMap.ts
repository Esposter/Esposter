import { VoiceLanguage } from "#src/models/VoiceLanguage";

// The prefix a dub's clips carry after `VO_`; the English dub has none
export const LanguageDubPrefixMap: Record<VoiceLanguage, string> = {
  [VoiceLanguage.Chinese]: "ZH_",
  [VoiceLanguage.English]: "",
  [VoiceLanguage.Japanese]: "JA_",
  [VoiceLanguage.Korean]: "KO_",
};
