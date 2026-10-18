import type { ArchiveProgress } from "#src/models/archive/ArchiveProgress";
import type { Artifact } from "#src/models/artifact/Artifact";
import type { ReliquarySetData } from "#src/models/reliquary/ReliquarySetData";

import { ArchiveSection } from "#src/models/archive/ArchiveSection";
import { ArtifactSlot } from "#src/models/artifact/ArtifactSlot";
import { openArchiveArtifactSets } from "#src/services/archive/openArchiveArtifactSets";
import { describe, expect, test } from "vitest";

// Made-up sets whose pieces take made-up item ids, so the test reads no game data
const FIVE_PIECE_SET_ID = 90_001;
const ONE_PIECE_SET_ID = 90_002;
const NO_ENTRY_SET_ID = 90_003;

const createReliquarySet = (id: number, slots: ArtifactSlot[]): ReliquarySetData => ({
  id,
  nameTextId: `TEST_SET_${id}`,
  needCounts: [2, 4],
  pieces: slots.map((slot, index) => ({
    itemId: id * 10 + index,
    nameTextId: `TEST_PIECE_${id}_${index}`,
    rank: 1,
    rarity: 5,
    slot,
  })),
});

const reliquarySets = [
  createReliquarySet(FIVE_PIECE_SET_ID, [
    ArtifactSlot.CircletOfLogos,
    ArtifactSlot.FlowerOfLife,
    ArtifactSlot.GobletOfEonothem,
    ArtifactSlot.PlumeOfDeath,
    ArtifactSlot.SandsOfEon,
  ]),
  createReliquarySet(ONE_PIECE_SET_ID, [ArtifactSlot.CircletOfLogos]),
  createReliquarySet(NO_ENTRY_SET_ID, [ArtifactSlot.CircletOfLogos]),
];

const createArtifact = (setId: number, slot: ArtifactSlot): Pick<Artifact, "setId" | "slot"> => ({ setId, slot });

describe(openArchiveArtifactSets, () => {
  const EQUIPMENT_ENTRY_IDS: ReadonlySet<number> = new Set([FIVE_PIECE_SET_ID, ONE_PIECE_SET_ID]);

  const emptyProgress: ArchiveProgress = new Map();

  test("keeps a five-piece set locked until its fifth slot is held", () => {
    expect.hasAssertions();

    const fourPieces = [
      createArtifact(FIVE_PIECE_SET_ID, ArtifactSlot.CircletOfLogos),
      createArtifact(FIVE_PIECE_SET_ID, ArtifactSlot.FlowerOfLife),
      createArtifact(FIVE_PIECE_SET_ID, ArtifactSlot.GobletOfEonothem),
      createArtifact(FIVE_PIECE_SET_ID, ArtifactSlot.PlumeOfDeath),
    ];

    expect(openArchiveArtifactSets(emptyProgress, fourPieces, EQUIPMENT_ENTRY_IDS, reliquarySets)).toBe(emptyProgress);
  });

  test("holding every piece opens the set", () => {
    expect.hasAssertions();

    const everyPiece = [
      createArtifact(FIVE_PIECE_SET_ID, ArtifactSlot.CircletOfLogos),
      createArtifact(FIVE_PIECE_SET_ID, ArtifactSlot.FlowerOfLife),
      createArtifact(FIVE_PIECE_SET_ID, ArtifactSlot.GobletOfEonothem),
      createArtifact(FIVE_PIECE_SET_ID, ArtifactSlot.PlumeOfDeath),
      createArtifact(FIVE_PIECE_SET_ID, ArtifactSlot.SandsOfEon),
    ];

    expect(openArchiveArtifactSets(emptyProgress, everyPiece, EQUIPMENT_ENTRY_IDS, reliquarySets)).toStrictEqual(
      new Map([[ArchiveSection.Equipment, new Set([FIVE_PIECE_SET_ID])]]),
    );
  });

  test("counts a repeated slot once", () => {
    expect.hasAssertions();

    const repeatedSlots = [
      createArtifact(FIVE_PIECE_SET_ID, ArtifactSlot.CircletOfLogos),
      createArtifact(FIVE_PIECE_SET_ID, ArtifactSlot.CircletOfLogos),
      createArtifact(FIVE_PIECE_SET_ID, ArtifactSlot.FlowerOfLife),
      createArtifact(FIVE_PIECE_SET_ID, ArtifactSlot.GobletOfEonothem),
      createArtifact(FIVE_PIECE_SET_ID, ArtifactSlot.PlumeOfDeath),
    ];

    expect(openArchiveArtifactSets(emptyProgress, repeatedSlots, EQUIPMENT_ENTRY_IDS, reliquarySets)).toBe(
      emptyProgress,
    );
  });

  test("opens a one-piece set on a single artifact", () => {
    expect.hasAssertions();

    expect(
      openArchiveArtifactSets(
        emptyProgress,
        [createArtifact(ONE_PIECE_SET_ID, ArtifactSlot.CircletOfLogos)],
        EQUIPMENT_ENTRY_IDS,
        reliquarySets,
      ),
    ).toStrictEqual(new Map([[ArchiveSection.Equipment, new Set([ONE_PIECE_SET_ID])]]));
  });

  test("opens no entry for a set that has no Equipment entry", () => {
    expect.hasAssertions();

    expect(
      openArchiveArtifactSets(
        emptyProgress,
        [createArtifact(NO_ENTRY_SET_ID, ArtifactSlot.CircletOfLogos)],
        EQUIPMENT_ENTRY_IDS,
        reliquarySets,
      ),
    ).toBe(emptyProgress);
  });

  test("keeps an opened set's entry when its pieces are no longer held", () => {
    expect.hasAssertions();

    const progress: ArchiveProgress = new Map([[ArchiveSection.Equipment, new Set([FIVE_PIECE_SET_ID])]]);

    expect(openArchiveArtifactSets(progress, [], EQUIPMENT_ENTRY_IDS, reliquarySets)).toBe(progress);
  });
});
