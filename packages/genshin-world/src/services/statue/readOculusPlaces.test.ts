import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { OculusKind } from "#src/models/oculus/OculusKind";
import { readOculusPlaces } from "#src/services/statue/readOculusPlaces";
import { describe, expect, test } from "vitest";

describe(readOculusPlaces, () => {
  test("reads each Oculus of a region with its kind and its ground point", async () => {
    expect.hasAssertions();

    const oculusPlaces = await readOculusPlaces(GAME_DATA_LOCAL_BASE_URL, "mondstadt");

    expect(oculusPlaces.length).toBeGreaterThan(0);
    for (const { kind, position } of oculusPlaces) {
      expect(Object.values(OculusKind)).toContain(kind);
      expect(position.x).toBeTypeOf("number");
      expect(position.z).toBeTypeOf("number");
    }
  });
});
