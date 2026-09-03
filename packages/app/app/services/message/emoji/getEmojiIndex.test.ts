import type { CustomEmoji } from "@/models/message/emoji/CustomEmoji";

import { EmojiGroups } from "@/models/message/emoji/EmojiGroup";
import { EmojiType } from "@/models/message/emoji/EmojiType";
import { SkinTone } from "@/models/message/emoji/SkinTone";
import { applySkinTone } from "@/services/message/emoji/applySkinTone";
import { MAX_EMOJI_SEARCH_RESULTS } from "@/services/message/emoji/constants";
import { getEmojiIndex } from "@/services/message/emoji/getEmojiIndex";
import { getEmojiSlug } from "@/services/message/emoji/getEmojiSlug";
import { searchEmojis } from "@/services/message/emoji/searchEmojis";
import { takeOne } from "@esposter/shared";
import characterEmojiRecordMap from "unicode-emoji-json/data-by-emoji.json";
import { describe, expect, test } from "vitest";

// Throws rather than returning undefined so a slug that stops existing upstream fails as a missing emoji
// Rather than as a confusing assertion about `undefined` further down
const getEmoji = (slug: string) => {
  const emoji = getEmojiIndex().slugEmojiMap.get(slug);
  if (!emoji) throw new Error(`No emoji indexed under "${slug}"`);
  return emoji;
};

describe("getEmojiIndex", () => {
  const RED_HEART = "❤️";
  const { slugEmojiMap } = getEmojiIndex();

  test("round trips every emoji from character to slug and back", () => {
    expect.hasAssertions();

    for (const emoji of slugEmojiMap.values()) expect(getEmojiSlug(emoji.character)).toBe(emoji.slug);
  });

  // A tooltip can be asked for a toned glyph, which has no record of its own — it resolves to its base
  test("resolves a toned character back to its untoned slug", () => {
    expect.hasAssertions();

    expect(getEmojiSlug(applySkinTone(getEmoji("technologist"), SkinTone.Medium))).toBe("technologist");
  });

  test("resolves an unqualified glyph onto the same slug as the qualified one", () => {
    expect.hasAssertions();

    expect(getEmojiSlug("❤")).toBe("red_heart");
    expect(getEmojiSlug(RED_HEART)).toBe("red_heart");
  });

  test("leaves a slug it already knows untouched", () => {
    expect.hasAssertions();

    expect(getEmojiSlug("thumbs_up")).toBe("thumbs_up");
  });

  test("returns an unknown string as itself rather than dropping it", () => {
    expect.hasAssertions();

    expect(getEmojiSlug("not_an_emoji")).toBe("not_an_emoji");
  });

  // `UnicodeEmojiRecord` is a hand-written assertion about a third-party JSON file that no schema validates,
  // So a dataset upgrade that adds, drops or renames a key would otherwise pass typecheck and lint untouched
  test("matches the shape the dataset actually ships", () => {
    expect.hasAssertions();

    expect(characterEmojiRecordMap["👋"]).toStrictEqual({
      emoji_version: "0.6",
      group: "People & Body",
      name: "waving hand",
      skin_tone_support: true,
      skin_tone_support_unicode_version: "1.0",
      slug: "waving_hand",
      unicode_version: "0.6",
    });
    // The version key is present on exactly the toneable records, which is what makes it the only optional one
    expect(
      Object.values(characterEmojiRecordMap).every(({ skin_tone_support, skin_tone_support_unicode_version }) =>
        skin_tone_support
          ? skin_tone_support_unicode_version !== undefined
          : skin_tone_support_unicode_version === undefined,
      ),
    ).toBe(true);
  });

  test("files every emoji under a group the enum lists", () => {
    expect.hasAssertions();

    const { groupEmojisMap } = getEmojiIndex();

    expect([...groupEmojisMap.keys()]).toStrictEqual(EmojiGroups);
    expect([...groupEmojisMap.values()].reduce((total, emojis) => total + emojis.length, 0)).toBe(slugEmojiMap.size);
  });
});

describe("applySkinTone", () => {
  const MAN_BEARD = "🧔‍♂️";
  const MAN_BOUNCING_BALL = "⛹️‍♂️";
  const RED_HEART = "❤️";
  const TECHNOLOGIST = "🧑‍💻";
  const manBeard = getEmoji("man_beard");
  const manBouncingBall = getEmoji("man_bouncing_ball");
  const redHeart = getEmoji("red_heart");
  const technologist = getEmoji("technologist");

  test("attaches the modifier to the first code point of a ZWJ sequence", () => {
    expect.hasAssertions();

    expect(technologist.character).toBe(TECHNOLOGIST);
    expect(applySkinTone(technologist, SkinTone.Medium)).toBe("🧑🏽‍💻");
    expect(applySkinTone(technologist, SkinTone.Dark)).toBe("🧑🏿‍💻");
    expect(applySkinTone(technologist, SkinTone.Default)).toBe(TECHNOLOGIST);
  });

  // The base's own selector is replaced by the tone, but a later one qualifies a different component — 131
  // Sequences carry one, and stripping it drops that component's emoji presentation
  test("keeps a variation selector that belongs to a later component", () => {
    expect.hasAssertions();

    expect(manBeard.character).toBe(MAN_BEARD);
    expect(applySkinTone(manBeard, SkinTone.Medium)).toBe("🧔🏽‍♂️");
    expect(applySkinTone(getEmoji("index_pointing_up"), SkinTone.Medium)).toBe("☝🏽");
    // Carries one of each: its own selector, which the tone replaces, and the sign's, which must survive
    expect(manBouncingBall.character).toBe(MAN_BOUNCING_BALL);
    expect(applySkinTone(manBouncingBall, SkinTone.Medium)).toBe("⛹🏽‍♂️");
  });

  test("leaves an emoji that does not support a tone alone", () => {
    expect.hasAssertions();

    expect(redHeart.isSkinToneSupported).toBe(false);
    expect(applySkinTone(redHeart, SkinTone.Medium)).toBe(RED_HEART);
  });
});

// These assert on the dataset's own records, so they narrow to it — a room's uploaded emoji carry an image
// Rather than a character and are searched in the same call
const searchUnicodeEmojis = (query: string) => searchEmojis(query).filter((emoji) => emoji.type === EmojiType.Unicode);

describe("searchEmojis", () => {
  const GRINNING_FACE = "😀";
  const MELTING_FACE = "🫠";
  const THUMBS_UP = "👍";
  const { slugEmojiMap } = getEmojiIndex();

  // A room's own emoji lead the list, which is the ranking Discord gives a server's own, and they take slots
  // From the cap rather than being appended past it
  test("puts the room's own matches ahead of the dataset's", () => {
    expect.hasAssertions();

    const customEmoji: CustomEmoji = {
      id: crypto.randomUUID(),
      name: "thumbs_up_parrot",
      sasUrl: "https://storage.test/emoji",
      slug: "thumbs_up_parrot",
      type: EmojiType.Custom,
    };

    expect(takeOne(searchEmojis("thumbs_up", [customEmoji]))).toStrictEqual(customEmoji);
  });

  test("pins an exact shortcode ahead of everything that merely matched it", () => {
    expect.hasAssertions();

    expect(takeOne(searchUnicodeEmojis("thumbs_up"), 0).character).toBe(THUMBS_UP);
  });

  test("matches on keywords, not only on names", () => {
    expect.hasAssertions();

    // The query `node-emoji` returned nothing for: `happy` is a keyword of 😀 and appears in no name
    expect(searchUnicodeEmojis("happy").map(({ character }) => character)).toContain(GRINNING_FACE);
  });

  test("intersects a multi-word query rather than unioning it", () => {
    expect.hasAssertions();

    expect(searchEmojis("grin f").length).toBeLessThan(slugEmojiMap.size);
    expect(searchEmojis("grin f").length).toBeLessThanOrEqual(searchEmojis("grin").length);
  });

  test("treats punctuation as a delimiter rather than compiling it", () => {
    expect.hasAssertions();

    // `node-emoji` threw `SyntaxError: Invalid regular expression` on exactly this input
    expect(searchEmojis("((")).toStrictEqual([]);
    expect(searchEmojis("grin(").map(({ slug }) => slug)).toContain("grinning_face");
  });

  test("finds an emoji newer than the dataset the retired library shipped", () => {
    expect.hasAssertions();

    expect(searchUnicodeEmojis("melting").map(({ character }) => character)).toContain(MELTING_FACE);
  });

  test("caps a one-character query at the display limit", () => {
    expect.hasAssertions();

    expect(searchEmojis("a").length).toBeLessThanOrEqual(MAX_EMOJI_SEARCH_RESULTS);
  });
});
