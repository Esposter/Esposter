import type { GroundPiece } from "#src/models/genshinAssets/fit/GroundPiece";
import type { GroundSource } from "#src/models/genshinAssets/fit/GroundSource";

import { fitGroundPiece } from "#src/services/genshinAssets/fit/fitGroundPiece";
import { describe, expect, test } from "vitest";

describe(fitGroundPiece, () => {
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
