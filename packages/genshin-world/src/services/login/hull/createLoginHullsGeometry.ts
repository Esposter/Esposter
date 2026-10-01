import hulls from "#src/data/login/hulls.json";
import { createBoxesGeometry } from "genshin-engine";
import { BufferGeometry, Matrix4, Quaternion, Vector3 } from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

// Every bridge and pillar of the login scene as one geometry: each part's hull the fit wrote, built once from its
// Boxes, then placed as each instance of it stands, turned and scaled
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
  const hullsGeometry = mergeGeometries(parts) ?? new BufferGeometry();
  for (const geometry of [...parts, ...hullGeometryMap.values()]) geometry.dispose();
  return hullsGeometry;
};
