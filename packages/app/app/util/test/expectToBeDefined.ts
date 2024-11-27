import { expect } from "vitest";

export function expectToBeDefined<T>(value: null | T | undefined): asserts value is T {
  expect(value).toBeDefined();
}
