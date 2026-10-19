import type { ArtifactSetData } from "#src/models/artifact/ArtifactSetData";

import { Attribute } from "#src/models/character/Attribute";
import { createArtifact } from "#src/services/artifact/createArtifact.test";
import { getArtifactSetAttributeLines } from "#src/services/artifact/getArtifactSetAttributeLines";
import { describe, expect, test } from "vitest";

describe(getArtifactSetAttributeLines, () => {
  const artifactSetDataMap = new Map<number, ArtifactSetData>([
    [
      1,
      {
        bonuses: [
          {
            attributeLines: [{ attribute: Attribute.HealthPercent, value: 0.2 }],
            descriptionTextHash: "",
            params: [],
            pieceCount: 2,
          },
          {
            attributeLines: [{ attribute: Attribute.ElementalMastery, value: 80 }],
            descriptionTextHash: "",
            params: [],
            pieceCount: 4,
          },
        ],
        id: 1,
      },
    ],
    [
      2,
      {
        bonuses: [
          {
            attributeLines: [{ attribute: Attribute.AttackPercent, value: 0.18 }],
            descriptionTextHash: "",
            params: [],
            pieceCount: 2,
          },
        ],
        id: 2,
      },
    ],
  ]);

  test("gives every bonus a set's worn pieces reach, and none to a set under its first", () => {
    expect.hasAssertions();

    expect(
      getArtifactSetAttributeLines(
        [
          createArtifact({ setId: 1 }),
          createArtifact({ setId: 1 }),
          createArtifact({ setId: 1 }),
          createArtifact({ setId: 1 }),
          createArtifact({ setId: 2 }),
        ],
        artifactSetDataMap,
      ),
    ).toStrictEqual([
      { attribute: Attribute.HealthPercent, value: 0.2 },
      { attribute: Attribute.ElementalMastery, value: 80 },
    ]);
  });
});
