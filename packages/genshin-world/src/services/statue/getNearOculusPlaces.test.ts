import { OculusKind } from "#src/models/oculus/OculusKind";
import { getNearOculusPlaces } from "#src/services/statue/getNearOculusPlaces";
import { describe, expect, test } from "vitest";

describe(getNearOculusPlaces, () => {
  test("a near Oculus shows on the minimap with a sound", () => {
    expect.hasAssertions();

    const oculusPlaces = [
      { id: "oculus-near", kind: OculusKind.Anemoculus, position: { x: 3, z: 4 } },
      { id: "oculus-far", kind: OculusKind.Anemoculus, position: { x: 300, z: 0 } },
      { id: "oculus-found", kind: OculusKind.Anemoculus, position: { x: 1, z: 1 } },
    ];

    expect(getNearOculusPlaces(oculusPlaces, new Set(["oculus-found"]), { x: 0, z: 0 }, 10)).toStrictEqual([
      oculusPlaces[0],
    ]);
  });
});
