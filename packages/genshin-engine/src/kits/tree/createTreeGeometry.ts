import type { LeafCards } from "#src/models/kits/tree/LeafCards";
import type { RootTubes } from "#src/models/kits/tree/RootTubes";
import type { TreeGeometry } from "#src/models/kits/tree/TreeGeometry";
import type { TreeOptions } from "#src/models/kits/tree/TreeOptions";

import { mergeGeometryParts } from "#src/kits/mergeGeometryParts";
import { computeLeafCards } from "#src/kits/tree/computeLeafCards";
import { computeRootTubes } from "#src/kits/tree/computeRootTubes";
import { computeTreeSkeleton } from "#src/kits/tree/computeTreeSkeleton";
import { BufferAttribute, BufferGeometry, CylinderGeometry, Quaternion, Vector3 } from "three";

const BRANCH_RADIAL_SEGMENTS = 7;
const UP = new Vector3(0, 1, 0);
// A generator's typed arrays wrapped as one indexed geometry
const createIndexedGeometry = ({ indices, normals, positions, uvs }: LeafCards | RootTubes): BufferGeometry => {
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(positions, 3));
  geometry.setAttribute("normal", new BufferAttribute(normals, 3));
  geometry.setAttribute("uv", new BufferAttribute(uvs, 2));
  geometry.setIndex(new BufferAttribute(indices, 1));
  return geometry;
};
// A tree as two geometries, one per material: its wood, every segment a tapered open cylinder and every surface root a
// Swept tube merged into one mesh, and its leaves, every card in one mesh, so a tree is two draws and a forest of one
// Species is two instanced draws
export const createTreeGeometry = (treeOptions: TreeOptions): TreeGeometry => {
  const branchSegments = computeTreeSkeleton(treeOptions);
  const direction = new Vector3();
  const rotation = new Quaternion();
  const segmentGeometries = branchSegments.map(({ end, endRadius, start, startRadius }) => {
    direction.subVectors(end, start);
    const length = direction.length();
    const segmentGeometry = new CylinderGeometry(endRadius, startRadius, length, BRANCH_RADIAL_SEGMENTS, 1, true);
    segmentGeometry.applyQuaternion(rotation.setFromUnitVectors(UP, direction.normalize()));
    segmentGeometry.translate((start.x + end.x) / 2, (start.y + end.y) / 2, (start.z + end.z) / 2);
    return segmentGeometry;
  });
  const branchGeometry = mergeGeometryParts([
    ...segmentGeometries,
    createIndexedGeometry(computeRootTubes(treeOptions.roots)),
  ]);

  const leafGeometry = createIndexedGeometry(computeLeafCards(treeOptions.clusters, treeOptions));
  leafGeometry.computeBoundingSphere();
  return { branchGeometry, leafGeometry };
};
