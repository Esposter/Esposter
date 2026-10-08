import { getPathHashKey } from "#src/services/genshinAssets/world/getPathHashKey";
import { describe, expect, test } from "vitest";

describe(getPathHashKey, () => {
  test("keys a path hash by its PathHashLast and PathHashPre, dropping the bits above them", () => {
    expect.hasAssertions();

    const pathHashLast = 0x12_34_56_78n;
    const pathHashPre = 0x9an;
    const higherBits = 1n << 60n;

    expect(getPathHashKey(String(higherBits | (pathHashLast << 8n) | pathHashPre))).toBe(
      String((pathHashLast << 8n) | pathHashPre),
    );
  });
});
