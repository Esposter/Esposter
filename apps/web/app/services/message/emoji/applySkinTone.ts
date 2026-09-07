import type { Emoji } from "@/models/message/emoji/Emoji";

import { SkinTone } from "@/models/message/emoji/SkinTone";
import { VARIATION_SELECTOR } from "@/services/message/emoji/constants";

// Takes the record rather than the character so the support flag cannot be forgotten — toning an emoji that
// Does not support one appends a stray modifier beside it (🍎🏽).
// The modifier attaches to the first code point, never the end: 🧑‍💻 is a ZWJ sequence whose tone belongs to
// The person, so appending naively gives 🧑‍💻🏻 where the correct form is 🧑🏽‍💻.
// Only the base's *own* variation selector goes, because the tone already qualifies that code point (☝️ tones
// To ☝🏽). Every later selector stays: it qualifies a different component, and stripping it corrupts the 131
// Sequences that carry one — 🧔‍♂️ would tone to 🧔🏽‍♂ and lose the sign's emoji presentation.
// Unicode allows a different tone per person in a sequence like 🧑‍🤝‍🧑, and one global setting only tones the
// First — Discord behaves the same way
export const applySkinTone = ({ character, isSkinToneSupported }: Emoji, skinTone: SkinTone) => {
  if (!isSkinToneSupported || skinTone === SkinTone.Default) return character;
  // oxlint-disable-next-line typescript/no-misused-spread -- splitting the sequence into code points is the point
  const [firstCodePoint = character, ...rest] = [...character];
  if (rest[0] === VARIATION_SELECTOR) rest.shift();
  return `${firstCodePoint}${skinTone}${rest.join("")}`;
};
