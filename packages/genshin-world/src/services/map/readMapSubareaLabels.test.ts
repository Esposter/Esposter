import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { readMapSubareaLabels } from "#src/services/map/readMapSubareaLabels";
import { describe, expect, test } from "vitest";

describe(readMapSubareaLabels, () => {
  // Each published label is one outline's, so the record holds more labels than it holds distinct names
  test("reads the published labels, each with its name's text id and a point in the catalogue's axes", async () => {
    expect.hasAssertions();

    const labels = await readMapSubareaLabels(GAME_DATA_LOCAL_BASE_URL);

    expect(labels).toHaveLength(313);
    expect(new Set(labels.map(({ nameTextId }) => nameTextId)).size).toBe(309);
    expect(labels[0]).toStrictEqual({
      levelOneAreaId: 1,
      levelTwoAreaId: 107,
      nameTextId: "3025114574",
      x: 363.45,
      z: 381.41,
    });
  });
});
