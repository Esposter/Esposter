import { WishEventKind } from "#src/models/genshinAssets/wish/WishEventKind";
import { parseWishPage } from "#src/services/genshinAssets/wish/parseWishPage";
import { describe, expect, test } from "vitest";

// The made-up page's title, which a refused page names
const title = "a";
// A banner page cut to its template and its Item Pool, its window on the epoch's first day at the offset given
const createWishPage = (timeStartOffset: string) => `{{Wish
|type = Weapon Event
|time_start = 1970-01-01 11:00:00
|time_start_offset = ${timeStartOffset}
|time_end = 1970-01-01 17:00:00
}}
===Item Pool===
{{Wish Pool
|weapon_5_F = a; b
|weapon_4_F = c; d; e
}}
`;

describe(parseWishPage, () => {
  test("an event banner page is read into its window and featured items", () => {
    expect.hasAssertions();

    expect(parseWishPage(title, createWishPage("GMT+8"))).toStrictEqual({
      endTime: Temporal.Instant.fromEpochMilliseconds(0).add({ hours: 9 }).epochMilliseconds,
      fiveStarNames: ["a", "b"],
      fourStarNames: ["c", "d", "e"],
      kind: WishEventKind.WeaponEvent,
      kindNumber: 1,
      startTime: Temporal.Instant.fromEpochMilliseconds(0).add({ hours: 3 }).epochMilliseconds,
    });
  });

  test("a character event banner's featured items are read from its character parameters", () => {
    expect.hasAssertions();

    expect(
      parseWishPage(
        title,
        createWishPage("GMT+8")
          .replace("|type = Weapon Event", "|type = Character Event")
          .replaceAll("|weapon_", "|character_"),
      ),
    ).toStrictEqual({
      endTime: Temporal.Instant.fromEpochMilliseconds(0).add({ hours: 9 }).epochMilliseconds,
      fiveStarNames: ["a", "b"],
      fourStarNames: ["c", "d", "e"],
      kind: WishEventKind.CharacterEvent,
      kindNumber: 1,
      startTime: Temporal.Instant.fromEpochMilliseconds(0).add({ hours: 3 }).epochMilliseconds,
    });
  });

  test("a page whose summary names its items in prose is read from its item pool", () => {
    expect.hasAssertions();

    expect(
      parseWishPage(
        title,
        createWishPage("GMT+8").replace(
          "===Item Pool===",
          '===Summary===\n* The 5-star weapon "a" [[a]] will get a huge drop-rate boost!\n===Item Pool===',
        ),
      ),
    ).toStrictEqual({
      endTime: Temporal.Instant.fromEpochMilliseconds(0).add({ hours: 9 }).epochMilliseconds,
      fiveStarNames: ["a", "b"],
      fourStarNames: ["c", "d", "e"],
      kind: WishEventKind.WeaponEvent,
      kindNumber: 1,
      startTime: Temporal.Instant.fromEpochMilliseconds(0).add({ hours: 3 }).epochMilliseconds,
    });
  });

  test("a page naming no offset is read at the Asia server's GMT+8", () => {
    expect.hasAssertions();

    expect(parseWishPage(title, createWishPage("GMT+8").replace("|time_start_offset = GMT+8\n", ""))).toStrictEqual({
      endTime: Temporal.Instant.fromEpochMilliseconds(0).add({ hours: 9 }).epochMilliseconds,
      fiveStarNames: ["a", "b"],
      fourStarNames: ["c", "d", "e"],
      kind: WishEventKind.WeaponEvent,
      kindNumber: 1,
      startTime: Temporal.Instant.fromEpochMilliseconds(0).add({ hours: 3 }).epochMilliseconds,
    });
  });

  test("an offset written as UTC is read at the same offset", () => {
    expect.hasAssertions();

    expect(parseWishPage(title, createWishPage("UTC+8"))).toStrictEqual({
      endTime: Temporal.Instant.fromEpochMilliseconds(0).add({ hours: 9 }).epochMilliseconds,
      fiveStarNames: ["a", "b"],
      fourStarNames: ["c", "d", "e"],
      kind: WishEventKind.WeaponEvent,
      kindNumber: 1,
      startTime: Temporal.Instant.fromEpochMilliseconds(0).add({ hours: 3 }).epochMilliseconds,
    });
  });

  test("a name a stray separator leaves empty is not an item", () => {
    expect.hasAssertions();

    expect(
      parseWishPage(title, createWishPage("GMT+8").replace("|weapon_4_F = c; d; e\n", "|weapon_4_F = c; d; e;\n")),
    ).toStrictEqual({
      endTime: Temporal.Instant.fromEpochMilliseconds(0).add({ hours: 9 }).epochMilliseconds,
      fiveStarNames: ["a", "b"],
      fourStarNames: ["c", "d", "e"],
      kind: WishEventKind.WeaponEvent,
      kindNumber: 1,
      startTime: Temporal.Instant.fromEpochMilliseconds(0).add({ hours: 3 }).epochMilliseconds,
    });
  });

  test("a page naming a second type of its kind is read as the second banner of that kind", () => {
    expect.hasAssertions();

    expect(
      parseWishPage(
        title,
        createWishPage("GMT+8").replace("|type = Weapon Event\n", "|type = Weapon Event\n|type2 = Weapon Event-2\n"),
      ),
    ).toStrictEqual({
      endTime: Temporal.Instant.fromEpochMilliseconds(0).add({ hours: 9 }).epochMilliseconds,
      fiveStarNames: ["a", "b"],
      fourStarNames: ["c", "d", "e"],
      kind: WishEventKind.WeaponEvent,
      kindNumber: 2,
      startTime: Temporal.Instant.fromEpochMilliseconds(0).add({ hours: 3 }).epochMilliseconds,
    });
  });

  test("a page naming its type twice is read as the type its item pool holds the featured five-stars of", () => {
    expect.hasAssertions();

    expect(
      parseWishPage(
        title,
        createWishPage("GMT+8").replace("|type = Weapon Event\n", "|type = Weapon Event\n|type = Character Event\n"),
      ),
    ).toStrictEqual({
      endTime: Temporal.Instant.fromEpochMilliseconds(0).add({ hours: 9 }).epochMilliseconds,
      fiveStarNames: ["a", "b"],
      fourStarNames: ["c", "d", "e"],
      kind: WishEventKind.WeaponEvent,
      kindNumber: 1,
      startTime: Temporal.Instant.fromEpochMilliseconds(0).add({ hours: 3 }).epochMilliseconds,
    });
  });

  test("a page naming its type twice with an item pool holding neither type's featured five-stars is refused", () => {
    expect.hasAssertions();

    expect(() =>
      parseWishPage(
        title,
        createWishPage("GMT+8")
          .replace("|type = Weapon Event\n", "|type = Weapon Event\n|type = Character Event\n")
          .replace("|weapon_5_F = a; b\n", ""),
      ),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: a, names its type more than once, and its Item Pool does not match exactly one of them]`,
    );
  });

  test("a window is read at the offset its page names", () => {
    expect.hasAssertions();

    expect(parseWishPage(title, createWishPage("GMT-1"))).toStrictEqual({
      endTime: Temporal.Instant.fromEpochMilliseconds(0).add({ hours: 18 }).epochMilliseconds,
      fiveStarNames: ["a", "b"],
      fourStarNames: ["c", "d", "e"],
      kind: WishEventKind.WeaponEvent,
      kindNumber: 1,
      startTime: Temporal.Instant.fromEpochMilliseconds(0).add({ hours: 12 }).epochMilliseconds,
    });
  });

  test("a page of another kind is not read", () => {
    expect.hasAssertions();

    expect(parseWishPage(title, "{{Wish\n|type = Chronicled\n}}")).toBeUndefined();
  });
});
