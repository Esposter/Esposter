import { toHostedAssetFileKey } from "#src/internal/services/toHostedAssetFileKey";
import { describe, expect, test } from "vitest";

describe(toHostedAssetFileKey, () => {
  test.each([
    ["Scene/Battle/ForestBackground.png", "SceneBattleForestBackground"],
    ["tilesets/axulart/BasicPlains.tsx", "TilesetsAxulartBasicPlainsTsx"],
  ])("%s derives %s", (path, key) => {
    expect.hasAssertions();

    expect(toHostedAssetFileKey(path)).toBe(key);
  });
});
