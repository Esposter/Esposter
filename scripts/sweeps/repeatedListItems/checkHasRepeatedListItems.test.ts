import { checkHasRepeatedListItems } from "#scripts/sweeps/repeatedListItems/checkHasRepeatedListItems";
import { describe, expect, test } from "vitest";

describe(checkHasRepeatedListItems, () => {
  const row = "<v-list-item />";

  // The whole reason this scan exists: a scan that reports nothing reads exactly like a looped tree, so the
  // First thing it owes is a planted violation it does report
  test("reports three rows written out one by one", () => {
    expect.hasAssertions();

    expect(checkHasRepeatedListItems(row.repeat(3))).toBe(true);
  });

  test("reports nothing for two rows, which is not yet a list", () => {
    expect.hasAssertions();

    expect(checkHasRepeatedListItems(row.repeat(2))).toBe(false);
  });

  test("reports nothing once a loop renders them", () => {
    expect.hasAssertions();

    expect(checkHasRepeatedListItems(`<v-list-item v-for="item of items" :key="item.id" />${row.repeat(3)}`)).toBe(
      false,
    );
  });

  // Without the trailing `[ >]` every shell carrying a title and a subtitle reads as three rows
  test("does not count a row's own title and subtitle as rows", () => {
    expect.hasAssertions();

    expect(checkHasRepeatedListItems("<v-list-item><v-list-item-title /><v-list-item-subtitle /></v-list-item>")).toBe(
      false,
    );
  });
});
