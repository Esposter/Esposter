import { getOrCreate } from "@/util/map/getOrCreate";
import { describe, expect, test } from "vitest";

describe(getOrCreate, () => {
  test("creates and stores value on missing key", () => {
    expect.hasAssertions();

    const map = new Map<string, string>();

    expect(getOrCreate(map, "", () => " ")).toBe(" ");
    expect(map.get("")).toBe(" ");
  });

  test("returns existing value without creating", () => {
    expect.hasAssertions();

    const map = new Map([["", ""]]);

    expect(getOrCreate(map, "", () => " ")).toBe("");
    expect(map.get("")).toBe("");
  });
});
