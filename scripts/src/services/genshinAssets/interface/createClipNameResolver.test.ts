import { createClipNameResolver } from "#src/services/genshinAssets/interface/createClipNameResolver";
import { crc32 } from "node:zlib";
import { describe, expect, test } from "vitest";

describe(createClipNameResolver, () => {
  test("resolves a property, a path from any ancestor, and the animator's own empty path", () => {
    expect.hasAssertions();

    const resolveName = createClipNameResolver(["Page/Foot/Buttons"]);

    expect(resolveName(1_574_349_066)).toBe("m_Alpha");
    expect(resolveName(crc32("Foot/Buttons"))).toBe("Foot/Buttons");
    expect(resolveName(0)).toBe("(the animator)");
    expect(resolveName(1)).toBe("1");
  });
});
