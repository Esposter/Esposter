import { EmojiGroups } from "@/models/message/emoji/EmojiGroup";
import { SkinTone } from "@/models/message/emoji/SkinTone";
import { applySkinTone } from "@/services/message/emoji/applySkinTone";
import { MAX_EMOJI_SEARCH_RESULTS } from "@/services/message/emoji/constants";
import { getEmojiIndex } from "@/services/message/emoji/getEmojiIndex";
import { getEmojiSlug } from "@/services/message/emoji/getEmojiSlug";
import { searchEmojis } from "@/services/message/emoji/searchEmojis";
import { takeOne } from "@esposter/shared";
import dataByCharacter from "unicode-emoji-json/data-by-emoji.json";
import { describe, expect, test } from "vitest";

const GRINNING_FACE = "😀";
const MELTING_FACE = "🫠";
const RED_HEART = "❤️";
const TECHNOLOGIST = "🧑‍💻";
const THUMBS_UP = "👍";

const { bySlug } = getEmojiIndex();
// Throws rather than returning undefined so a slug that stops existing upstream fails as a missing emoji
// Rather than as a confusing assertion about `undefined` further down
const getEmoji = (slug: string) => {
  const emoji = bySlug.get(slug);
  if (!emoji) throw new Error(`No emoji indexed under "${slug}"`);
  return emoji;
};
const redHeart = getEmoji("red_heart");
const technologist = getEmoji("technologist");

describe("getEmojiIndex", () => {
  test("round trips every emoji from character to slug and back", () => {
    expect.hasAssertions();

    for (const emoji of bySlug.values()) expect(getEmojiSlug(emoji.character)).toBe(emoji.slug);
  });

  test("resolves a toned character back to its untoned slug", () => {
    expect.hasAssertions();

    expect(getEmojiSlug(applySkinTone(technologist, SkinTone.Medium))).toBe("technologist");
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

  test("returns an unknown tag as itself rather than dropping it", () => {
    expect.hasAssertions();

    expect(getEmojiSlug("not_an_emoji")).toBe("not_an_emoji");
  });

  // `UnicodeEmojiRecord` is a hand-written assertion about a third-party JSON file that no schema validates,
  // So a dataset upgrade that adds, drops or renames a key would otherwise pass typecheck and lint untouched
  test("matches the shape the dataset actually ships", () => {
    expect.hasAssertions();

    expect(dataByCharacter["👋"]).toStrictEqual({
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
      Object.values(dataByCharacter).every(({ skin_tone_support, skin_tone_support_unicode_version }) =>
        skin_tone_support
          ? skin_tone_support_unicode_version !== undefined
          : skin_tone_support_unicode_version === undefined,
      ),
    ).toBe(true);
  });

  test("files every emoji under a group the enum lists", () => {
    expect.hasAssertions();

    const { byGroup } = getEmojiIndex();

    expect([...byGroup.keys()]).toStrictEqual(EmojiGroups);
    expect([...byGroup.values()].reduce((total, emojis) => total + emojis.length, 0)).toBe(bySlug.size);
  });
});

describe("applySkinTone", () => {
  test("attaches the modifier to the first code point of a ZWJ sequence", () => {
    expect.hasAssertions();

    expect(technologist.character).toBe(TECHNOLOGIST);
    expect(applySkinTone(technologist, SkinTone.Medium)).toBe("🧑🏽‍💻");
    expect(applySkinTone(technologist, SkinTone.Dark)).toBe("🧑🏿‍💻");
    expect(applySkinTone(technologist, SkinTone.Default)).toBe(TECHNOLOGIST);
  });

  test("leaves an emoji that does not support a tone alone", () => {
    expect.hasAssertions();

    expect(redHeart.isSkinToneSupported).toBe(false);
    expect(applySkinTone(redHeart, SkinTone.Medium)).toBe(RED_HEART);
  });
});

describe("searchEmojis", () => {
  test("pins an exact shortcode ahead of everything that merely matched it", () => {
    expect.hasAssertions();

    expect(takeOne(searchEmojis("thumbs_up"), 0).character).toBe(THUMBS_UP);
  });

  test("matches on keywords, not only on names", () => {
    expect.hasAssertions();

    // The query `node-emoji` returned nothing for: `happy` is a keyword of 😀 and appears in no name
    expect(searchEmojis("happy").map(({ character }) => character)).toContain(GRINNING_FACE);
  });

  test("intersects a multi-word query rather than unioning it", () => {
    expect.hasAssertions();

    expect(searchEmojis("grin f").length).toBeLessThan(bySlug.size);
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

    expect(searchEmojis("melting").map(({ character }) => character)).toContain(MELTING_FACE);
  });

  test("caps a one-character query at the display limit", () => {
    expect.hasAssertions();

    expect(searchEmojis("a").length).toBeLessThanOrEqual(MAX_EMOJI_SEARCH_RESULTS);
  });
});
