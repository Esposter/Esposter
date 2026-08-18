import type { Emoji } from "@/models/message/emoji/Emoji";

import { SkinTone } from "@/models/message/emoji/SkinTone";
import { VARIATION_SELECTOR } from "@/services/message/emoji/constants";

// Takes the record rather than the character so the support flag cannot be forgotten — toning an emoji that
// Does not support one appends a stray modifier beside it (🍎🏽).
// The modifier attaches to the first code point, never the end: 🧑‍💻 is a ZWJ sequence whose tone belongs to
// The person, so appending naively gives 🧑‍💻🏻 where the correct form is 🧑🏽‍💻. Variation selectors go with it,
// Since a toned code point is already fully qualified. Unicode allows a different tone per person in a
// Sequence like 🧑‍🤝‍🧑, and one global setting only tones the first — Discord behaves the same way
export const applySkinTone = ({ character, isSkinToneSupported }: Emoji, skinTone: SkinTone) => {
  if (!isSkinToneSupported || skinTone === SkinTone.Default) return character;
  // oxlint-disable-next-line typescript/no-misused-spread -- splitting the sequence into code points is the point
  const [firstCodePoint = character, ...rest] = [...character];
  return `${firstCodePoint}${skinTone}${rest.filter((codePoint) => codePoint !== VARIATION_SELECTOR).join("")}`;
};
