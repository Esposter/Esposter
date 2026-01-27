import { expect } from "vitest";
// oxlint-disable-next-line func-style
export function expectToBeDefined<T>(value: null | T | undefined): asserts value is T {
  expect(value).toBeDefined();
}
