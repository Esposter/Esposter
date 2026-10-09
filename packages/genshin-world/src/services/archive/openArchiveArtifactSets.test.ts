import type { ArchiveProgress } from "#src/models/archive/ArchiveProgress";
import type { Artifact } from "#src/models/artifact/Artifact";

import { ArchiveSection } from "#src/models/archive/ArchiveSection";
import { ArtifactSlot } from "#src/models/artifact/ArtifactSlot";
import { openArchiveArtifactSets } from "#src/services/archive/openArchiveArtifactSets";
import { describe, expect, test } from "vitest";

const FIVE_PIECE_SET_ID = 10_001;
const ONE_PIECE_SET_ID = 15_009;
const NO_ENTRY_SET_ID = 15_004;
const EQUIPMENT_ENTRY_IDS: ReadonlySet<number> = new Set([FIVE_PIECE_SET_ID, ONE_PIECE_SET_ID]);

const createArtifact = (setId: number, slot: ArtifactSlot): Pick<Artifact, "setId" | "slot"> => ({ setId, slot });

describe(openArchiveArtifactSets, () => {
  const emptyProgress: ArchiveProgress = new Map();

  test("keeps a five-piece set locked until its fifth slot is held", () => {
    expect.hasAssertions();

    const fourPieces = [
      createArtifact(FIVE_PIECE_SET_ID, ArtifactSlot.CircletOfLogos),
      createArtifact(FIVE_PIECE_SET_ID, ArtifactSlot.FlowerOfLife),
      createArtifact(FIVE_PIECE_SET_ID, ArtifactSlot.GobletOfEonothem),
      createArtifact(FIVE_PIECE_SET_ID, ArtifactSlot.PlumeOfDeath),
    ];

    expect(openArchiveArtifactSets(emptyProgress, fourPieces, EQUIPMENT_ENTRY_IDS)).toBe(emptyProgress);
    expect(
      openArchiveArtifactSets(
        emptyProgress,
        [...fourPieces, createArtifact(FIVE_PIECE_SET_ID, ArtifactSlot.SandsOfEon)],
        EQUIPMENT_ENTRY_IDS,
      ),
    ).toStrictEqual(new Map([[ArchiveSection.Equipment, new Set([FIVE_PIECE_SET_ID])]]));
  });

  test("opens a one-piece set on a single artifact", () => {
    expect.hasAssertions();

    expect(
      openArchiveArtifactSets(
        emptyProgress,
        [createArtifact(ONE_PIECE_SET_ID, ArtifactSlot.CircletOfLogos)],
        EQUIPMENT_ENTRY_IDS,
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
      ),
    ).toBe(emptyProgress);
  });

  test("keeps an opened set's entry when its pieces are no longer held", () => {
    expect.hasAssertions();

    const progress: ArchiveProgress = new Map([[ArchiveSection.Equipment, new Set([FIVE_PIECE_SET_ID])]]);

    expect(openArchiveArtifactSets(progress, [], EQUIPMENT_ENTRY_IDS)).toBe(progress);
  });
});
