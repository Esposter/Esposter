import { clusterEnemyMarks } from "#src/services/genshinAssets/camps/clusterEnemyMarks";
import { describe, expect, test } from "vitest";

describe(clusterEnemyMarks, () => {
  test("nearby enemy marks form one camp", () => {
    expect.hasAssertions();
    // Each mark lies five units from the next, so the chain joins all three within a distance of ten
    const places = [
      { id: "", kind: "", position: { x: 0, z: 0 } },
      { id: "", kind: "", position: { x: 4, z: 3 } },
      { id: "", kind: "", position: { x: 8, z: 6 } },
    ];
    expect(clusterEnemyMarks(places, 10)).toStrictEqual([places]);
  });

  test("marks farther apart than the clustering distance form separate camps", () => {
    expect.hasAssertions();
    const places = [
      { id: "", kind: "", position: { x: 0, z: 0 } },
      { id: "", kind: "", position: { x: 11, z: 0 } },
    ];
    expect(clusterEnemyMarks(places, 10)).toStrictEqual([[places[0]], [places[1]]]);
  });
});
