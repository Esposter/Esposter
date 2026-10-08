import { DesertRuinPieceKind } from "#src/models/sumeru/DesertRuinPieceKind";
import { createDesertRuinGeometry } from "#src/services/sumeru/createDesertRuinGeometry";
import { Box3, Vector3 } from "three";
import { describe, expect, test } from "vitest";

describe(createDesertRuinGeometry, () => {
  test("stands each piece at its position on the ground", () => {
    expect.hasAssertions();

    const geometry = createDesertRuinGeometry([
      { baseRadius: 2, height: 10, kind: DesertRuinPieceKind.Obelisk, position: { x: 20, z: -5 } },
    ]);
    geometry.computeBoundingBox();
    const center = (geometry.boundingBox ?? new Box3()).getCenter(new Vector3());

    expect(center.x).toBeCloseTo(20);
    expect(center.z).toBeCloseTo(-5);
  });
});
