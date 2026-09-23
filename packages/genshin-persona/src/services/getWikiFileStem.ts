import { WIKI_VOICE_FILE_EXTENSION, WIKI_VOICE_FILE_PREFIX } from "#src/services/constants";

// The template's placeholder for the dub, which most file names carry and some pages leave to the template
const LANGUAGE_PLACEHOLDER = "{language}";
// A wiki title spells a space either way, and one template spells it as the underscore
const TITLE_SPACE = "_";
// A line's file name as the template writes it is the prefix, the dub's placeholder, the character's name and the
// Title; what is kept is the part every dub shares
export const getWikiFileStem = (file: string, namePlaceholder: string, name: string): string =>
  file
    .replace(WIKI_VOICE_FILE_PREFIX, "")
    .replace(LANGUAGE_PLACEHOLDER, "")
    .replace(WIKI_VOICE_FILE_EXTENSION, "")
    .replaceAll(namePlaceholder, name)
    .replaceAll(TITLE_SPACE, " ")
    .trim();
