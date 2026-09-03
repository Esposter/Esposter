import { SkinTones } from "@/models/message/emoji/SkinTone";
import { VARIATION_SELECTOR } from "@/services/message/emoji/constants";

const SkinToneModifiers = new Set<string>(SkinTones);

// `characterEmojiMap` is built and queried on this key, so one emoji has exactly one identity however it arrived:
// A toned pick (👋🏽), an unqualified legacy glyph (❤) and the dataset's own form (❤️) all collapse onto it
export const getEmojiCharacterKey = (character: string) =>
  // oxlint-disable-next-line typescript/no-misused-spread -- code points are exactly the unit being filtered
  [...character].filter((codePoint) => codePoint !== VARIATION_SELECTOR && !SkinToneModifiers.has(codePoint)).join("");
