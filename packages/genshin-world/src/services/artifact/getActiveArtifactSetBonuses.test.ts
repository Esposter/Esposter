import type { Artifact } from "#src/models/artifact/Artifact";
import type { ArtifactSetData } from "#src/models/artifact/ArtifactSetData";

import { ArtifactSlot } from "#src/models/artifact/ArtifactSlot";
import { Attribute } from "#src/models/character/Attribute";
import { getActiveArtifactSetBonuses } from "#src/services/artifact/getActiveArtifactSetBonuses";
import { describe, expect, test } from "vitest";

describe(getActiveArtifactSetBonuses, () => {
  const SET_ID = 1;
  const artifactSetDataMap = new Map<number, ArtifactSetData>([
    [
      SET_ID,
      {
        bonuses: [
          { attributeLines: [{ attribute: Attribute.Health, value: 10 }], params: [], pieceCount: 2 },
          { attributeLines: [{ attribute: Attribute.Attack, value: 20 }], params: [], pieceCount: 4 },
        ],
        id: SET_ID,
      },
    ],
  ]);
  const createArtifact = (slot: ArtifactSlot, setId = SET_ID): Artifact => ({
    experience: 0,
    isLocked: false,
    level: 0,
    mainAffix: Attribute.Health,
    minorAffixes: [],
    rarity: 5,
    setId,
    slot,
  });

  test("a set's two-piece bonus is active from two pieces", () => {
    expect.hasAssertions();

    const twoPieces = [createArtifact(ArtifactSlot.CircletOfLogos), createArtifact(ArtifactSlot.FlowerOfLife)];
    expect(getActiveArtifactSetBonuses(twoPieces, artifactSetDataMap)).toStrictEqual([
      { attributeLines: [{ attribute: Attribute.Health, value: 10 }], params: [], pieceCount: 2, setId: SET_ID },
    ]);
  });

  test("a set's four-piece bonus is active from four pieces", () => {
    expect.hasAssertions();

    const twoPieces = [createArtifact(ArtifactSlot.CircletOfLogos), createArtifact(ArtifactSlot.FlowerOfLife)];
    const fourPieces = [
      ...twoPieces,
      createArtifact(ArtifactSlot.GobletOfEonothem),
      createArtifact(ArtifactSlot.PlumeOfDeath),
    ];
    expect(getActiveArtifactSetBonuses(fourPieces, artifactSetDataMap)).toStrictEqual([
      { attributeLines: [{ attribute: Attribute.Health, value: 10 }], params: [], pieceCount: 2, setId: SET_ID },
      { attributeLines: [{ attribute: Attribute.Attack, value: 20 }], params: [], pieceCount: 4, setId: SET_ID },
    ]);
  });

  test("a single piece of a set activates none of its bonuses", () => {
    expect.hasAssertions();

    expect(
      getActiveArtifactSetBonuses([createArtifact(ArtifactSlot.CircletOfLogos)], artifactSetDataMap),
    ).toStrictEqual([]);
  });

  test("a set the table does not hold is refused", () => {
    expect.hasAssertions();

    expect(() =>
      getActiveArtifactSetBonuses(
        [createArtifact(ArtifactSlot.CircletOfLogos, 999), createArtifact(ArtifactSlot.FlowerOfLife, 999)],
        artifactSetDataMap,
      ),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: getActiveArtifactSetBonuses, 999]`,
    );
  });
});
