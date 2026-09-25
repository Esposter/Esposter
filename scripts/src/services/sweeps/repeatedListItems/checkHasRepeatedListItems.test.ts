import { checkHasRepeatedListItems } from "#src/services/sweeps/repeatedListItems/checkHasRepeatedListItems";
import { describe, expect, test } from "vitest";

describe(checkHasRepeatedListItems, () => {
  const row = "<button ui-item />";

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

    expect(checkHasRepeatedListItems(`<button v-for="item of items" :key="item.id" ui-item />${row.repeat(3)}`)).toBe(
      false,
    );
  });

  // Without the lookahead every name starting `ui-item` reads as a row of its own
  test("does not count a longer name as a row", () => {
    expect.hasAssertions();

    expect(checkHasRepeatedListItems("<div ui-item><div ui-item-content /><div ui-item-content /></div>")).toBe(false);
  });
});
