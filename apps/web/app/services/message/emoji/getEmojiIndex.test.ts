import type { CustomEmoji } from "#src/models/message/emoji/CustomEmoji";

import { EmojiType } from "#src/models/message/emoji/EmojiType";
import { SkinTone } from "#src/models/message/emoji/SkinTone";
import { applySkinTone } from "#src/services/message/emoji/applySkinTone";
import { MAX_EMOJI_SEARCH_RESULTS } from "#src/services/message/emoji/constants";
import { getEmojiIndex } from "#src/services/message/emoji/getEmojiIndex";
import { getEmojiSlug } from "#src/services/message/emoji/getEmojiSlug";
import { searchEmojis } from "#src/services/message/emoji/searchEmojis";
import { takeOne } from "@esposter/shared";
import characterEmojiRecordMap from "unicode-emoji-json/data-by-emoji.json";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

// Throws rather than returning undefined so a slug that stops existing upstream fails as a missing emoji
// Rather than as a confusing assertion about `undefined` further down
const getEmoji = (slug: string) => {
  const emoji = getEmojiIndex().slugEmojiMap.get(slug);
  if (!emoji) throw new Error(`No emoji indexed under "${slug}"`);
  return emoji;
};

describe(getEmojiIndex, () => {
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

  test("files each emoji under exactly one group", () => {
    expect.hasAssertions();

    const { groupEmojisMap } = getEmojiIndex();

    expect([...groupEmojisMap.values()].reduce((total, emojis) => total + emojis.length, 0)).toBe(slugEmojiMap.size);
  });
});

describe(applySkinTone, () => {
  const RED_HEART = "❤️";
  const MAN_BEARD = "🧔‍♂️";
  const MAN_BOUNCING_BALL = "⛹️‍♂️";
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

describe(searchEmojis, () => {
  const MELTING_FACE = "🫠";

  // A room's own emoji lead the list, which is the ranking Discord gives a server's own, and they take slots
  // From the cap rather than being appended past it
  test("puts the room's own matches ahead of the dataset's", () => {
    expect.hasAssertions();

    const customEmoji: CustomEmoji = {
      id: v7(),
      name: "thumbs_up_parrot",
      presignedUrl: "https://storage.test/emoji",
      slug: "thumbs_up_parrot",
      type: EmojiType.Custom,
    };

    expect(takeOne(searchEmojis("thumbs_up", [customEmoji]))).toStrictEqual(customEmoji);
  });

  test("finds an emoji by its exact shortcode", () => {
    expect.hasAssertions();

    expect(searchUnicodeEmojis("thumbs_up").map(({ slug }) => slug)).toMatchInlineSnapshot(`
      [
        "thumbs_up",
      ]
    `);
  });

  test("matches on keywords, not only on names", () => {
    expect.hasAssertions();

    // `happy` is a keyword of 😀 and appears in no name, so only the keyword blob can match it
    expect(searchUnicodeEmojis("happy").map(({ character }) => character)).toMatchInlineSnapshot(`
      [
        "😂",
        "🙂",
        "😀",
        "🐮",
        "😉",
        "🙋",
        "🙋‍♂️",
        "🙋‍♀️",
        "😺",
        "😁",
        "☺️",
        "😸",
        "😹",
        "🥲",
        "😅",
        "😈",
        "🌈",
        "😃",
        "😊",
        "😄",
        "😋",
        "😆",
      ]
    `);
  });

  test("intersects a multi-word query rather than unioning it", () => {
    expect.hasAssertions();

    expect(searchEmojis("grin f").map(({ slug }) => slug)).toMatchInlineSnapshot(`
      [
        "grinning_face",
        "grinning_face_with_smiling_eyes",
        "grinning_squinting_face",
        "grinning_cat_with_smiling_eyes",
        "grinning_face_with_big_eyes",
        "grinning_face_with_sweat",
        "grinning_cat",
        "beaming_face_with_smiling_eyes",
        "zany_face",
        "star_struck",
      ]
    `);
  });

  test("treats punctuation as a delimiter rather than compiling it", () => {
    expect.hasAssertions();

    expect(searchEmojis("((")).toStrictEqual([]);
    expect(searchEmojis("grin(").map(({ slug }) => slug)).toMatchInlineSnapshot(`
      [
        "grinning_face",
        "grinning_squinting_face",
        "grinning_cat_with_smiling_eyes",
        "grinning_face_with_smiling_eyes",
        "grinning_cat",
        "grinning_face_with_sweat",
        "grinning_face_with_big_eyes",
        "beaming_face_with_smiling_eyes",
        "star_struck",
        "zany_face",
      ]
    `);
  });

  test("finds an emoji from a recent Unicode release", () => {
    expect.hasAssertions();

    expect(searchUnicodeEmojis("melting").map(({ character }) => character)).toStrictEqual([MELTING_FACE]);
  });

  test("caps a one-character query at the display limit", () => {
    expect.hasAssertions();

    expect(searchEmojis("a")).toHaveLength(MAX_EMOJI_SEARCH_RESULTS);
  });
});
