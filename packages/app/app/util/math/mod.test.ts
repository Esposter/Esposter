import { mod } from "@/util/math/mod";
import { describe, expect, test } from "vitest";

describe(mod, () => {
  test("mods", () => {
    expect.hasAssertions();

    expect(mod(1, 2)).toBe(1);
    expect(mod(-1, 2)).toBe(1);
  });
});
