import type { ArtifactSetData } from "#src/models/artifact/ArtifactSetData";

import { ArtifactSlot } from "#src/models/artifact/ArtifactSlot";
import { Attribute } from "#src/models/character/Attribute";
import { getArtifactSetAttributeLines } from "#src/services/artifact/getArtifactSetAttributeLines";
import { describe, expect, test } from "vitest";

const createArtifact = (setId: number) => ({
  level: 0,
  mainAffix: Attribute.Health,
  minorAffixes: [],
  rarity: 5,
  setId,
  slot: ArtifactSlot.FlowerOfLife,
});

describe(getArtifactSetAttributeLines, () => {
  const artifactSetDataMap = new Map<number, ArtifactSetData>([
    [
      1,
      {
        bonuses: [
          { attributeLines: [{ attribute: Attribute.HealthPercent, value: 0.2 }], pieceCount: 2 },
          { attributeLines: [{ attribute: Attribute.ElementalMastery, value: 80 }], pieceCount: 4 },
        ],
        id: 1,
      },
    ],
    [2, { bonuses: [{ attributeLines: [{ attribute: Attribute.AttackPercent, value: 0.18 }], pieceCount: 2 }], id: 2 }],
  ]);

  test("gives every bonus a set's worn pieces reach, and none to a set under its first", () => {
    expect.hasAssertions();

    expect(
      getArtifactSetAttributeLines(
        [createArtifact(1), createArtifact(1), createArtifact(1), createArtifact(1), createArtifact(2)],
        artifactSetDataMap,
      ),
    ).toStrictEqual([
      { attribute: Attribute.HealthPercent, value: 0.2 },
      { attribute: Attribute.ElementalMastery, value: 80 },
    ]);
  });
});
