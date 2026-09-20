import type { VoiceLanguage } from "#src/models/VoiceLanguage";

import { REFERENCES_DIRECTORY, WIKI_VOICE_FILE_EXTENSION } from "#src/services/constants";
import { join } from "node:path";

// The characters Windows refuses in a file name; a ":" would otherwise make the rest of the name an alternate
// Data stream on an empty file, silently
const UNSAFE_FILE_NAME_CHARACTERS_REGEX = /[<>:"/|?*]/gu;
const FILE_NAME_CHARACTER_REPLACEMENT = "-";

// Where one line's clip is cached, under its dub and by its own stem, so a reference the ear moves to another
// Line is fetched rather than read back from the old one
export const getReferencePath = (stem: string, language: VoiceLanguage): string =>
  join(
    REFERENCES_DIRECTORY,
    language,
    `${stem.replaceAll(UNSAFE_FILE_NAME_CHARACTERS_REGEX, FILE_NAME_CHARACTER_REPLACEMENT)}${WIKI_VOICE_FILE_EXTENSION}`,
  );
