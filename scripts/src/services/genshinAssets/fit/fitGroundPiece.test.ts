import type { GroundPiece } from "#src/models/genshinAssets/fit/GroundPiece";
import type { GroundSource } from "#src/models/genshinAssets/fit/GroundSource";
import type { DomainEntranceLandmark } from "genshin-world";

import { fitGroundPiece } from "#src/services/genshinAssets/fit/fitGroundPiece";
import { GameTextKey } from "genshin-text";
import { DomainKind, LandmarkKind } from "genshin-world";
import { describe, expect, test } from "vitest";

const createDomainEntrance = (entryId: number, x: number): DomainEntranceLandmark => ({
  areaId: "test-area",
  arrival: { heightOffset: 0, position: { x, z: 0 }, rotation: 0 },
  domainKind: DomainKind.Blessing,
  entryId,
  heightOffset: 0,
  id: `domain-entrance-${entryId}`,
  kind: LandmarkKind.DomainEntrance,
  position: { x, z: 0 },
  rotation: 0,
  titleTextKey: GameTextKey.DomainEntrance24,
});

describe(fitGroundPiece, () => {
  test("reads a place outside its piece's outline as outside its ground, never against the tiles under it", async () => {
    expect.hasAssertions();

    const piece: GroundPiece = {
      centre: { x: 0, z: 0 },
      // The piece's outline is the half of its square west of x = 0, as a neighbouring area's ground lies east of it
      checkIsInside: (x) => x <= 0,
      half: 300,
      key: "ground/test/outline",
    };
    const source: GroundSource = {
      getCityAreas: () => Promise.resolve([]),
      getGameHeight: (x, z) => Math.sin(x / 90) * 3 + Math.cos(z / 70) * 2 + 50,
      landmarks: [createDomainEntrance(1, -100), createDomainEntrance(2, 100)],
      origin: [0, 0, 0],
    };

    const { build } = await fitGroundPiece(piece, source);
    const clearedNote = build.notes.find((note) => note.includes("places cleared of the residual, "));

    // Each entry's fitted residual is left out of these matches, so they name the words that entry takes
    expect(clearedNote).toContain("domain-entrance-1 60 metres from the bar's radius, its residual ");
    expect(clearedNote).toContain("domain-entrance-2 60 metres from the bar's radius, outside its ground");
  });

  test("reports a band with no sample in words, never as NaN, where no terrain lies under the centre", async () => {
    expect.hasAssertions();

    const piece: GroundPiece = {
      centre: { x: 0, z: 0 },
      checkIsInside: () => true,
      half: 300,
      key: "ground/test/centre",
    };
    const source: GroundSource = {
      getCityAreas: () => Promise.resolve([]),
      // No terrain within 200 metres of the centre, as an export that misses the tile under it leaves it
      getGameHeight: (x, z) => (Math.hypot(x, z) < 200 ? Number.NaN : Math.sin(x / 90) * 3 + Math.cos(z / 70) * 2),
      landmarks: [],
      origin: [0, 0, 0],
    };

    const { build } = await fitGroundPiece(piece, source);

    expect(build.notes.filter((note) => note.includes("NaN"))).toStrictEqual([]);
    expect(build.notes.join("\n")).toContain("hills, no samples within 60, no samples within 150, ");
    expect(build.notes.join("\n")).toContain("its mean weight no samples within 60, no samples within 150, ");
  });
});
