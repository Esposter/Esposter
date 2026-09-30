import type { ExtrudeGeometry } from "three";

import silhouettes from "#src/data/login/silhouettes.json";
import { createSilhouetteGeometry } from "genshin-engine";
import { BufferGeometry, Matrix4, Quaternion, Vector3 } from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

// Every bridge and pillar of the login scene as one geometry: each silhouette the fit wrote, extruded once, then
// Placed as each instance of it stands, turned and scaled
export const createLoginSilhouettesGeometry = (): BufferGeometry => {
  const silhouetteGeometryMap = new Map<string, ExtrudeGeometry>(
    Object.entries(silhouettes.silhouettes).map(
      ([
        name,
        {
          contours,
          depth: [front = 0, back = 0],
        },
      ]) => [name, createSilhouetteGeometry({ contours: contours as [number, number][][], depth: [front, back] })],
    ),
  );
  const matrix = new Matrix4();
  const parts = silhouettes.placements.flatMap(({ position, rotation, scale, silhouette }) => {
    const silhouetteGeometry = silhouetteGeometryMap.get(silhouette);
    if (!silhouetteGeometry) return [];
    matrix.compose(new Vector3(...position), new Quaternion(...rotation), new Vector3(...scale));
    return [silhouetteGeometry.clone().applyMatrix4(matrix)];
  });
  const silhouettesGeometry = mergeGeometries(parts) ?? new BufferGeometry();
  for (const geometry of [...parts, ...silhouetteGeometryMap.values()]) geometry.dispose();
  return silhouettesGeometry;
};
