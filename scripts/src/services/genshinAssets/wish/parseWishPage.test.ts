import { WishEventKind } from "#src/models/genshinAssets/wish/WishEventKind";
import { parseWishPage } from "#src/services/genshinAssets/wish/parseWishPage";
import { describe, expect, test } from "vitest";

// A banner page cut to its template and its Summary, its window on the epoch's first day at the offset given
const createWishPage = (timeStartOffset: string) => `{{Wish
|type = Weapon Event
|time_start = 1970-01-01 11:00:00
|time_start_offset = ${timeStartOffset}
|time_end = 1970-01-01 17:00:00
}}
===Summary===
* {{Wish Item|a; b}}
* {{Wish Item|c; d}} and {{Wish Item|e}}
* {{Wish Item|a}}
`;

describe(parseWishPage, () => {
  test("an event banner page is read into its window and featured items", () => {
    expect.hasAssertions();

    expect(parseWishPage(createWishPage("GMT+8"))).toStrictEqual({
      endTime: Temporal.Instant.fromEpochMilliseconds(0).add({ hours: 9 }).epochMilliseconds,
      fiveStarNames: ["a", "b"],
      fourStarNames: ["c", "d", "e"],
      kind: WishEventKind.WeaponEvent,
      startTime: Temporal.Instant.fromEpochMilliseconds(0).add({ hours: 3 }).epochMilliseconds,
    });
  });

  test("a page naming no offset is read at the Asia server's GMT+8", () => {
    expect.hasAssertions();

    expect(parseWishPage(createWishPage("GMT+8").replace("|time_start_offset = GMT+8\n", ""))).toStrictEqual({
      endTime: Temporal.Instant.fromEpochMilliseconds(0).add({ hours: 9 }).epochMilliseconds,
      fiveStarNames: ["a", "b"],
      fourStarNames: ["c", "d", "e"],
      kind: WishEventKind.WeaponEvent,
      startTime: Temporal.Instant.fromEpochMilliseconds(0).add({ hours: 3 }).epochMilliseconds,
    });
  });

  test("an offset written as UTC is read at the same offset", () => {
    expect.hasAssertions();

    expect(parseWishPage(createWishPage("UTC+8"))).toStrictEqual({
      endTime: Temporal.Instant.fromEpochMilliseconds(0).add({ hours: 9 }).epochMilliseconds,
      fiveStarNames: ["a", "b"],
      fourStarNames: ["c", "d", "e"],
      kind: WishEventKind.WeaponEvent,
      startTime: Temporal.Instant.fromEpochMilliseconds(0).add({ hours: 3 }).epochMilliseconds,
    });
  });

  test("a page spacing its Summary heading and bullets loosely is read as the same page", () => {
    expect.hasAssertions();

    expect(
      parseWishPage(createWishPage("GMT+8").replace("===Summary===", "===Summary ===").replaceAll(/^\* /gmu, "*")),
    ).toStrictEqual({
      endTime: Temporal.Instant.fromEpochMilliseconds(0).add({ hours: 9 }).epochMilliseconds,
      fiveStarNames: ["a", "b"],
      fourStarNames: ["c", "d", "e"],
      kind: WishEventKind.WeaponEvent,
      startTime: Temporal.Instant.fromEpochMilliseconds(0).add({ hours: 3 }).epochMilliseconds,
    });
  });

  test("a name a stray separator leaves empty is not an item", () => {
    expect.hasAssertions();

    expect(parseWishPage(createWishPage("GMT+8").replace("{Wish Item|e}", "{Wish Item|e;}"))).toStrictEqual({
      endTime: Temporal.Instant.fromEpochMilliseconds(0).add({ hours: 9 }).epochMilliseconds,
      fiveStarNames: ["a", "b"],
      fourStarNames: ["c", "d", "e"],
      kind: WishEventKind.WeaponEvent,
      startTime: Temporal.Instant.fromEpochMilliseconds(0).add({ hours: 3 }).epochMilliseconds,
    });
  });

  test("a window is read at the offset its page names", () => {
    expect.hasAssertions();

    expect(parseWishPage(createWishPage("GMT-1"))).toStrictEqual({
      endTime: Temporal.Instant.fromEpochMilliseconds(0).add({ hours: 18 }).epochMilliseconds,
      fiveStarNames: ["a", "b"],
      fourStarNames: ["c", "d", "e"],
      kind: WishEventKind.WeaponEvent,
      startTime: Temporal.Instant.fromEpochMilliseconds(0).add({ hours: 12 }).epochMilliseconds,
    });
  });

  test("a page of another kind is not read", () => {
    expect.hasAssertions();

    expect(parseWishPage("{{Wish\n|type = Chronicled\n}}")).toBeUndefined();
  });
});
