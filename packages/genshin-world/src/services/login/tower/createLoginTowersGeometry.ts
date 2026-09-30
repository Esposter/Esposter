import towers from "#src/data/login/towers.json";
import { LOGIN_TOWER_RADIAL_SEGMENTS } from "#src/services/login/tower/constants";
import { createLatheStackGeometry } from "genshin-engine";
import { BufferGeometry } from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

// Every tower of the login scene as one geometry: each profile the fit wrote, built as a lathe of its sections, scaled
// And stood where the scene stands each instance of it
export const createLoginTowersGeometry = (): BufferGeometry => {
  const parts = towers.placements.flatMap(({ position: [x = 0, y = 0, z = 0], scale, tower }) => {
    const sections = towers.profiles[tower as keyof typeof towers.profiles];
    if (!sections) return [];
    return [
      createLatheStackGeometry({ isFaceted: false, radialSegments: LOGIN_TOWER_RADIAL_SEGMENTS, sections })
        .scale(scale, scale, scale)
        .translate(x, y, z),
    ];
  });
  const towersGeometry = mergeGeometries(parts) ?? new BufferGeometry();
  for (const part of parts) part.dispose();
  return towersGeometry;
};
