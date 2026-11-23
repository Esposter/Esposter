import type { FishingPropPlace } from "#src/models/fishing/FishingPropPlace";
import type { BufferGeometry, Material } from "three";

import { computeFishingPropPlacements } from "#src/services/fishingProps/computeFishingPropPlacements";
import { FISHING_PROP_STAND_IN_COLOR } from "#src/services/fishingProps/constants";
import { createPropStandInGeometry, setObjectSurface } from "genshin-engine";
import { Group, Mesh } from "three";

// The stand-ins of one region's fishing-area props: one mesh for each place, at the place's position, turn and scale,
// With One geometry shared by the places of each prop name and the one material every stand-in shares. The geometries
// Are Returned so the component holding the group disposes them with the material
export const createFishingPropGroup = (
  places: readonly FishingPropPlace[],
  material: Material,
): { geometries: BufferGeometry[]; group: Group } => {
  const group = new Group();
  const geometries: BufferGeometry[] = [];
  for (const name of new Set(places.map((place) => place.name))) {
    const geometry = createPropStandInGeometry(name);
    geometries.push(geometry);
    for (const { position, rotation, scale } of computeFishingPropPlacements(name, places)) {
      const propMesh = new Mesh(geometry, material);
      propMesh.position.set(...position);
      propMesh.quaternion.set(...rotation);
      propMesh.scale.set(...scale);
      propMesh.castShadow = true;
      propMesh.receiveShadow = true;
      setObjectSurface(propMesh, FISHING_PROP_STAND_IN_COLOR);
      group.add(propMesh);
    }
  }
  return { geometries, group };
};
