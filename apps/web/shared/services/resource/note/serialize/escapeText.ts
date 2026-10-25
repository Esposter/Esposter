import { SPECIAL_CHARACTER_REGEX } from "#shared/services/resource/note/serialize/constants";

export const escapeText = (text: string) => text.replaceAll(SPECIAL_CHARACTER_REGEX, (character) => `\\${character}`);
