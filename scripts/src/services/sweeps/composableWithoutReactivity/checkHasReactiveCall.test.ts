import { checkHasReactiveCall } from "#src/services/sweeps/composableWithoutReactivity/checkHasReactiveCall";
import { describe, expect, test } from "vitest";

describe(checkHasReactiveCall, () => {
  // A scan that reports nothing reads exactly like a swept tree, so the first thing it owes is a planted case it does
  // Report: a composable that holds no reactive state and calls nothing reactive
  test("finds no reactive call in a composable that calls nothing reactive", () => {
    expect.hasAssertions();

    expect(checkHasReactiveCall("export const useNothing = () => 1;")).toBe(false);
  });

  test("passes a composable that calls ref", () => {
    expect.hasAssertions();

    expect(checkHasReactiveCall("export const useCount = () => ref(0);")).toBe(true);
  });

  // The generic bracket is the trap: a pattern ending at `(` reads this composable as holding no reactive call
  test("passes a composable whose call carries a generic bracket", () => {
    expect.hasAssertions();

    expect(checkHasReactiveCall("export const useDesmos = () => useScript<typeof Desmos>(url);")).toBe(true);
  });

  // The word boundary is the other trap: a name ending in `ref` is not a `ref(` call
  test("does not read a call whose name only ends in ref", () => {
    expect.hasAssertions();

    expect(checkHasReactiveCall("export const useIt = () => myref(1);")).toBe(false);
  });
});
