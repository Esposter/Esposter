import { getPlainGameText } from "#src/services/genshinText/getPlainGameText";

// Every rich-text tag but a colour's
const UNCOLORED_RICH_TEXT_TAG_REGEX = /<\/?(?!color\b)[a-z]+(?:=[^>]*)?>/giu;

// A text map string as the game's interface draws it: read as `getPlainGameText` reads it, its colour tags kept, which a
// Screen splits into coloured runs (`splitGameTextColors`)
export const getInterfaceGameText = (text: string): string => getPlainGameText(text, UNCOLORED_RICH_TEXT_TAG_REGEX);
