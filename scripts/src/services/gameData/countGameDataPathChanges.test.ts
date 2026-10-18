import { countGameDataPathChanges } from "#src/services/gameData/countGameDataPathChanges";
import { describe, expect, test } from "vitest";

describe(countGameDataPathChanges, () => {
  test("counts a field each row stopped holding as one path", () => {
    expect.hasAssertions();

    const countMap = new Map<string, number>();
    countGameDataPathChanges(
      countMap,
      "",
      [
        { id: 1, value: 2 },
        { id: 2, value: 3 },
      ],
      [{ id: 1 }, { id: 2 }],
    );

    expect(countMap).toStrictEqual(new Map([["[].value removed", 2]]));
  });

  test("counts a row present on one side once, at its root", () => {
    expect.hasAssertions();

    const countMap = new Map<string, number>();
    countGameDataPathChanges(
      countMap,
      "",
      { rows: [{ id: 1 }] },
      { name: "a", rows: [{ id: 1 }, { id: 2, value: 4 }] },
    );

    expect(countMap).toStrictEqual(
      new Map([
        ["name added", 1],
        ["rows[] added", 1],
      ]),
    );
  });

  test("matches rows by their id, so a table read in another order changes nothing", () => {
    expect.hasAssertions();

    const countMap = new Map<string, number>();
    countGameDataPathChanges(
      countMap,
      "",
      [
        { id: 1, value: 2 },
        { id: 2, value: 3 },
      ],
      [
        { id: 2, value: 3 },
        { id: 1, value: 4 },
        { id: 3, value: 5 },
      ],
    );

    expect(countMap).toStrictEqual(
      new Map([
        ["[].value changed", 1],
        ["[] added", 1],
      ]),
    );
  });

  test("counts the entries of a record keyed by id as one path", () => {
    expect.hasAssertions();

    const countMap = new Map<string, number>();
    countGameDataPathChanges(
      countMap,
      "",
      { groups: { "1": { x: 1 }, "2": { x: 2 } } },
      { groups: { "1": {}, "2": {} } },
    );

    expect(countMap).toStrictEqual(new Map([["groups.#.x removed", 2]]));
  });

  test("counts nothing for equal values", () => {
    expect.hasAssertions();

    const countMap = new Map<string, number>();
    countGameDataPathChanges(countMap, "", { a: [1, { b: "c" }] }, { a: [1, { b: "c" }] });

    expect(countMap.size).toBe(0);
  });

  test("counts a changed root value at the root", () => {
    expect.hasAssertions();

    const countMap = new Map<string, number>();
    countGameDataPathChanges(countMap, "", 1, 2);

    expect(countMap).toStrictEqual(new Map([["(root) changed", 1]]));
  });
});
