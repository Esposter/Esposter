import type { VoiceLanguage } from "#src/models/VoiceLanguage";

import { WIKI_VOICE_FILE_EXTENSION, WIKI_VOICE_FILE_PREFIX } from "#src/services/constants";
import { LanguageDubPrefixMap } from "#src/services/LanguageDubPrefixMap";

// The wiki's title for one line's clip in one dub, composed from the stem the reference selection committed: the
// Stem is the same in every dub, and the dub is the prefix between it and `VO_`
export const getWikiFileTitle = (stem: string, language: VoiceLanguage): string =>
  `File:${WIKI_VOICE_FILE_PREFIX}${LanguageDubPrefixMap[language]}${stem}${WIKI_VOICE_FILE_EXTENSION}`;
