import type { ArtifactMainAffixCurve } from "#src/models/artifact/ArtifactMainAffixCurve";

import { Attribute } from "#src/models/character/Attribute";
import { createArtifact } from "#src/services/artifact/createArtifact.test";
import { getArtifactMainAffixValue } from "#src/services/artifact/getArtifactMainAffixValue";
import { describe, expect, test } from "vitest";

describe(getArtifactMainAffixValue, () => {
  // The five-star curve from +0 to +4, and a four-star one the five-star artifact must not read
  const artifactMainAffixCurves: ArtifactMainAffixCurve[] = [
    { attribute: Attribute.HealthPercent, rarity: 4, values: [0.035] },
    { attribute: Attribute.HealthPercent, rarity: 5, values: [0.0466, 0.0932, 0.1399, 0.1865, 0.2332] },
  ];

  test("a main affix is the value its rarity's curve gives at the artifact's level", () => {
    expect.hasAssertions();

    expect(
      getArtifactMainAffixValue(
        createArtifact({ level: 2, mainAffix: Attribute.HealthPercent, rarity: 5 }),
        artifactMainAffixCurves,
      ),
    ).toBe(0.1399);
  });

  test("an artifact whose main affix has no curve at its rarity is refused", () => {
    expect.hasAssertions();

    expect(() =>
      getArtifactMainAffixValue(
        createArtifact({ level: 0, mainAffix: Attribute.HealthPercent, rarity: 3 }),
        artifactMainAffixCurves,
      ),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: getArtifactMainAffixValue, FIGHT_PROP_HP_PERCENT at rarity 3]`,
    );
  });
});
