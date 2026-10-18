import { WishEventKind } from "#src/models/genshinAssets/wish/WishEventKind";
import { toWishScheduleEvent } from "#src/services/genshinAssets/wish/toWishScheduleEvent";
import { describe, expect, test } from "vitest";

describe(toWishScheduleEvent, () => {
  test("each featured name joins the one item it names", () => {
    expect.hasAssertions();

    const nameIdsMap = new Map([
      ["b", [1]],
      ["c", [2]],
    ]);

    expect(
      toWishScheduleEvent(
        "a",
        {
          endTime: 0,
          fiveStarNames: ["b"],
          fourStarNames: ["c"],
          kind: WishEventKind.WeaponEvent,
          kindNumber: 1,
          startTime: 0,
        },
        nameIdsMap,
      ),
    ).toStrictEqual({
      endTime: 0,
      fiveStarIds: [1],
      fourStarIds: [2],
      id: "a",
      kind: WishEventKind.WeaponEvent,
      kindNumber: 1,
      startTime: 0,
    });
  });

  test("a schedule naming an unknown item fails the build", () => {
    expect.hasAssertions();

    expect(() =>
      toWishScheduleEvent(
        "a",
        {
          endTime: 0,
          fiveStarNames: ["b"],
          fourStarNames: [],
          kind: WishEventKind.WeaponEvent,
          kindNumber: 1,
          startTime: 0,
        },
        new Map(),
      ),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: b, joins no item in the names]`,
    );
  });

  test("an event banner featuring no five-star fails the build naming the banner", () => {
    expect.hasAssertions();

    for (const kind of [WishEventKind.CharacterEvent, WishEventKind.WeaponEvent])
      expect(() =>
        toWishScheduleEvent(
          "a",
          { endTime: 0, fiveStarNames: [], fourStarNames: ["c"], kind, kindNumber: 1, startTime: 0 },
          new Map([["c", [2]]]),
        ),
      ).toThrowErrorMatchingInlineSnapshot(
        `[InvalidOperationError: Invalid operation: Read, name: a, features no five-star]`,
      );
  });

  test("a name joining more than one item keeps every item it joins", () => {
    expect.hasAssertions();

    expect(
      toWishScheduleEvent(
        "a",
        {
          endTime: 0,
          fiveStarNames: ["b"],
          fourStarNames: [],
          kind: WishEventKind.WeaponEvent,
          kindNumber: 1,
          startTime: 0,
        },
        new Map([["b", [1, 2]]]),
      ),
    ).toStrictEqual({
      endTime: 0,
      fiveStarIds: [1, 2],
      fourStarIds: [],
      id: "a",
      kind: WishEventKind.WeaponEvent,
      kindNumber: 1,
      startTime: 0,
    });
  });
});
