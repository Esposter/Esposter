import type { BufferGeometry } from "three";

import hulls from "#src/data/login/hulls.json";
import { createBoxesGeometry, mergeGeometryParts } from "genshin-engine";
import { Matrix4, Quaternion, Vector3 } from "three";

// Every bridge and pillar of the login scene as one geometry: each part's hull the fit wrote, built once from its
// Boxes, then placed as each instance of it stands, turned and scaled, where the blocks lay it; the towers' row
// Stands it off that by its offset
export const createLoginHullsGeometry = (): BufferGeometry => {
  const hullGeometryMap = new Map<string, BufferGeometry>(
    Object.entries(hulls.hulls).map(([name, boxes]) => [name, createBoxesGeometry(boxes)]),
  );
  const matrix = new Matrix4();
  const parts = hulls.placements.flatMap(({ hull, position, rotation, scale }) => {
    const hullGeometry = hullGeometryMap.get(hull);
    if (!hullGeometry) return [];
    matrix.compose(new Vector3(...position), new Quaternion(...rotation), new Vector3(...scale));
    return [hullGeometry.clone().applyMatrix4(matrix)];
  });
  const hullsGeometry = mergeGeometryParts(parts);
  for (const hullGeometry of hullGeometryMap.values()) hullGeometry.dispose();
  return hullsGeometry;
};
