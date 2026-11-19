import type { FishingPropPlace } from "#src/models/fishing/FishingPropPlace";

import { createFishingPropGroup } from "#src/services/fishingProps/createFishingPropGroup";
import { describe, expect, test } from "vitest";
import { MeshBasicMaterial } from "three";

describe(createFishingPropGroup, () => {
  const places: FishingPropPlace[] = [
    {
      name: "Area_Common_Prop_Fishing_09_Vo",
      position: [427.7, 0.1, -279.1],
      rotation: [0.012, -0.99, 0.002, -0.119],
      scale: [1, 1, 1],
    },
    {
      name: "Area_Common_Prop_Fishing_09_Vo",
      position: [425.2, -0.1, -278.4],
      rotation: [0, 0, 0, 1],
      scale: [1.5, 1, 1.5],
    },
    {
      name: "Area_Nt_Prop_LCGY_GlobefishBall_02",
      position: [-4651.3, 10.6, -10377.2],
      rotation: [0, 0, 0, 1],
      scale: [1, 1, 1],
    },
  ];

  test("a prop is drawn once per place, at that place's position, turn and scale", () => {
    expect.hasAssertions();

    const material = new MeshBasicMaterial();
    const { geometries, group } = createFishingPropGroup(places, material);

    expect(group.children.map((mesh) => mesh.position.toArray())).toStrictEqual(places.map(({ position }) => position));
    expect(group.children.map((mesh) => mesh.quaternion.toArray())).toStrictEqual(
      places.map(({ rotation }) => rotation),
    );
    expect(group.children.map((mesh) => mesh.scale.toArray())).toStrictEqual(places.map(({ scale }) => scale));
    expect(geometries).toHaveLength(2);
    material.dispose();
    for (const geometry of geometries) geometry.dispose();
  });

  test("every stand-in of the region shares its one material", () => {
    expect.hasAssertions();

    const material = new MeshBasicMaterial();
    const { geometries, group } = createFishingPropGroup(places, material);

    expect(group.children.every((mesh) => "material" in mesh && mesh.material === material)).toBe(true);
    material.dispose();
    for (const geometry of geometries) geometry.dispose();
  });
});
