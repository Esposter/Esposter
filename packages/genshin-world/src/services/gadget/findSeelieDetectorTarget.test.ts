import type { PuzzlePlace } from "#src/models/puzzle/PuzzlePlace";

import { PuzzleKind } from "#src/models/puzzle/PuzzleKind";
import { findSeelieDetectorTarget } from "#src/services/gadget/findSeelieDetectorTarget";
import { describe, expect, test } from "vitest";

const place = (id: string, kind: PuzzleKind, x: number, z: number): PuzzlePlace => ({ id, kind, position: { x, z } });

describe(findSeelieDetectorTarget, () => {
  // The puzzle places of the region the player stands in: a court nearest of all, which is no Seelie, and a settled Seelie
  const nearest = place("nearest", PuzzleKind.Seelie, 10, 10);
  const farther = place("farther", PuzzleKind.Seelie, 50, 50);
  const settled = place("settled", PuzzleKind.Seelie, 1, 1);
  const court = place("court", PuzzleKind.SeelieCourt, 0, 1);
  const regionPuzzlePlaces = [nearest, farther, settled, court];
  const player = { x: 0, z: 0 };

  test("a Seelie detector points to the nearest crystal in its region", () => {
    expect.hasAssertions();

    expect(findSeelieDetectorTarget(regionPuzzlePlaces, new Set([settled.id]), player)).toBe(nearest);
    expect(findSeelieDetectorTarget(regionPuzzlePlaces, new Set([nearest.id, settled.id]), player)).toBe(farther);
  });
});
