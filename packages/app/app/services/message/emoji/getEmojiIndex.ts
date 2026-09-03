import type { Emoji } from "@/models/message/emoji/Emoji";
import type { EmojiIndex } from "@/models/message/emoji/EmojiIndex";

import { EmojiGroup, EmojiGroups } from "@/models/message/emoji/EmojiGroup";
import { EmojiType } from "@/models/message/emoji/EmojiType";
import { getEmojiCharacterKey } from "@/services/message/emoji/getEmojiCharacterKey";
import characterEmojiRecordMap from "unicode-emoji-json/data-by-emoji.json";

const EmojiGroupValues = new Set<string>(EmojiGroups);

let emojiIndex: EmojiIndex | undefined;

// Built on first use rather than at import, so nothing pays for it on a page with no emoji surface, and once
// Rather than per consumer — a reaction list, the picker and the composer all read the same three maps
export const getEmojiIndex = () => (emojiIndex ??= createEmojiIndex());

// Every emoji the dataset ships is offered, with no version cutoff: whichever Unicode release
// `unicode-emoji-json` is pinned to in the catalog is the one the picker has, so bumping the dependency is
// The whole of "support the newest emoji". Whether a glyph actually renders is the reader's OS and font
// Talking, which no build-time filter can know — if a box is ever reported, the answer is runtime canvas
// Measurement, not a hardcoded version.
// Source: https://github.com/muan/unicode-emoji-json, generated from https://unicode.org/Public/emoji
const createEmojiIndex = (): EmojiIndex => {
  const characterEmojiMap = new Map<string, Emoji>();
  const groupEmojisMap = new Map<EmojiGroup, Emoji[]>(EmojiGroups.map((group) => [group, []]));
  const slugEmojiMap = new Map<string, Emoji>();

  for (const [character, record] of Object.entries(characterEmojiRecordMap)) {
    // A group the enum does not list has no tab to render under. Nothing is filtered today — the dataset ships
    // Exactly these nine, keeping its skin-tone modifiers in a separate file — so this is the guard that makes
    // A tenth group appearing upstream a missing tab rather than an unreachable category
    if (!EmojiGroupValues.has(record.group)) continue;

    const group = record.group as EmojiGroup;
    const emoji: Emoji = {
      character,
      group,
      isSkinToneSupported: record.skin_tone_support,
      name: record.name,
      slug: record.slug,
      type: EmojiType.Unicode,
    };
    characterEmojiMap.set(getEmojiCharacterKey(character), emoji);
    groupEmojisMap.get(group)?.push(emoji);
    slugEmojiMap.set(emoji.slug, emoji);
  }

  return { characterEmojiMap, groupEmojisMap, slugEmojiMap };
};
