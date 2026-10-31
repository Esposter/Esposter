import type { ArtifactSetData } from "#src/models/artifact/ArtifactSetData";

import { ArtifactSlot } from "#src/models/artifact/ArtifactSlot";
import { Attribute } from "#src/models/character/Attribute";
import { createArtifact } from "#src/services/artifact/createArtifact.test";
import { getActiveArtifactSetBonuses } from "#src/services/artifact/getActiveArtifactSetBonuses";
import { describe, expect, test } from "vitest";

describe(getActiveArtifactSetBonuses, () => {
  const SET_ID = 1;
  const artifactSetDataMap = new Map<number, ArtifactSetData>([
    [
      SET_ID,
      {
        bonuses: [
          {
            attributeLines: [{ attribute: Attribute.Health, value: 10 }],
            descriptionTextHash: "",
            params: [],
            pieceCount: 2,
          },
          {
            attributeLines: [{ attribute: Attribute.Attack, value: 20 }],
            descriptionTextHash: "",
            params: [],
            pieceCount: 4,
          },
        ],
        id: SET_ID,
      },
    ],
  ]);
  const twoPieces = [
    createArtifact({ slot: ArtifactSlot.CircletOfLogos }),
    createArtifact({ slot: ArtifactSlot.FlowerOfLife }),
  ];
  const twoPieceBonus = {
    attributeLines: [{ attribute: Attribute.Health, value: 10 }],
    descriptionTextHash: "",
    params: [],
    pieceCount: 2,
    setId: SET_ID,
  };

  test("a set's two-piece bonus is active from two pieces", () => {
    expect.hasAssertions();

    expect(getActiveArtifactSetBonuses(twoPieces, artifactSetDataMap)).toStrictEqual([twoPieceBonus]);
  });

  test("a set's four-piece bonus is active from four pieces", () => {
    expect.hasAssertions();

    const fourPieces = [
      ...twoPieces,
      createArtifact({ slot: ArtifactSlot.GobletOfEonothem }),
      createArtifact({ slot: ArtifactSlot.PlumeOfDeath }),
    ];
    expect(getActiveArtifactSetBonuses(fourPieces, artifactSetDataMap)).toStrictEqual([
      twoPieceBonus,
      {
        attributeLines: [{ attribute: Attribute.Attack, value: 20 }],
        descriptionTextHash: "",
        params: [],
        pieceCount: 4,
        setId: SET_ID,
      },
    ]);
  });

  test("a single piece of a set activates none of its bonuses", () => {
    expect.hasAssertions();

    expect(
      getActiveArtifactSetBonuses([createArtifact({ slot: ArtifactSlot.CircletOfLogos })], artifactSetDataMap),
    ).toStrictEqual([]);
  });

  test("a set the table does not hold is refused", () => {
    expect.hasAssertions();

    expect(() =>
      getActiveArtifactSetBonuses(
        [
          createArtifact({ setId: 999, slot: ArtifactSlot.CircletOfLogos }),
          createArtifact({ setId: 999, slot: ArtifactSlot.FlowerOfLife }),
        ],
        artifactSetDataMap,
      ),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: getActiveArtifactSetBonuses, 999]`,
    );
  });
});
