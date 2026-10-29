import { getRecordPath } from "#src/services/genshinParity/reference/getRecordPath";
import { describe, expect, test } from "vitest";

describe(getRecordPath, () => {
  test("writes a Windows-style relative path with forward slashes", () => {
    expect.hasAssertions();

    expect(getRecordPath(String.raw`extracted\maps\gi_map.bin`)).toBe("extracted/maps/gi_map.bin");
  });

  test("keeps a relative path already written with forward slashes", () => {
    expect.hasAssertions();

    expect(getRecordPath("extracted/login/placements.json")).toBe("extracted/login/placements.json");
  });
});
