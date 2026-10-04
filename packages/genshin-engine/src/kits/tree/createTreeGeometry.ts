import type { TreeGeometry } from "#src/kits/tree/TreeGeometry";
import type { TreeOptions } from "#src/kits/tree/TreeOptions";

import { mergeGeometryParts } from "#src/kits/mergeGeometryParts";
import { computeLeafCards } from "#src/kits/tree/computeLeafCards";
import { computeTreeSkeleton } from "#src/kits/tree/computeTreeSkeleton";
import { BufferAttribute, BufferGeometry, CylinderGeometry, Quaternion, Vector3 } from "three";

const BRANCH_RADIAL_SEGMENTS = 7;
const UP = new Vector3(0, 1, 0);
// A tree as two geometries, one per material: its wood, every segment a tapered open cylinder merged into one mesh,
// And its leaves, every card in one mesh, so a tree is two draws and a forest of one species is two instanced draws
export const createTreeGeometry = (treeOptions: TreeOptions): TreeGeometry => {
  const { branchSegments, clusterCenters } = computeTreeSkeleton(treeOptions);
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
  const branchGeometry = mergeGeometryParts(segmentGeometries);

  const { indices, normals, positions, uvs } = computeLeafCards(clusterCenters, treeOptions);
  const leafGeometry = new BufferGeometry();
  leafGeometry.setAttribute("position", new BufferAttribute(positions, 3));
  leafGeometry.setAttribute("normal", new BufferAttribute(normals, 3));
  leafGeometry.setAttribute("uv", new BufferAttribute(uvs, 2));
  leafGeometry.setIndex(new BufferAttribute(indices, 1));
  leafGeometry.computeBoundingSphere();
  return { branchGeometry, leafGeometry };
};
