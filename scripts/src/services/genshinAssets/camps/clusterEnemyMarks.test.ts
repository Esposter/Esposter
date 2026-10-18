import { clusterEnemyMarks } from "#src/services/genshinAssets/camps/clusterEnemyMarks";
import { describe, expect, test } from "vitest";

describe(clusterEnemyMarks, () => {
  test("Nearby enemy marks form one camp", () => {
    expect.hasAssertions();
    // Each mark lies five units from the next, so the chain joins all three within a distance of ten
    const places = [
      { id: "slime-1", kind: "Slime", position: { x: 0, z: 0 } },
      { id: "slime-2", kind: "Slime", position: { x: 4, z: 3 } },
      { id: "slime-3", kind: "Slime", position: { x: 8, z: 6 } },
    ];
    expect(clusterEnemyMarks(places, 10)).toStrictEqual([places]);
  });

  test("Marks farther apart than the clustering distance form separate camps", () => {
    expect.hasAssertions();
    const places = [
      { id: "slime-1", kind: "Slime", position: { x: 0, z: 0 } },
      { id: "slime-2", kind: "Slime", position: { x: 11, z: 0 } },
    ];
    expect(clusterEnemyMarks(places, 10)).toStrictEqual([[places[0]], [places[1]]]);
  });
});
