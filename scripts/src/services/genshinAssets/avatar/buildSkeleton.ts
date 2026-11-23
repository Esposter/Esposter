import type { AvatarRigNode } from "#src/models/genshinAssets/avatar/AvatarRigNode";
import type { RendererBone } from "#src/models/genshinAssets/avatar/RendererBone";
import type { AvatarBone } from "genshin-world/sceneExport";

import { addedNode } from "#src/services/genshinAssets/avatar/addedNode";
import { depth } from "#src/services/genshinAssets/avatar/depth";
import { mirrorAvatarPoint } from "#src/services/genshinAssets/avatar/mirrorAvatarPoint";
import { mirrorAvatarRotation } from "#src/services/genshinAssets/avatar/mirrorAvatarRotation";
import { getFilename, InvalidOperationError, Operation } from "@esposter/shared";

// The rig's nodes, then every bone a mesh names that the rig lacks, parents first, each in three's axes. A bone's path
// Is Its parent's path and its own name, so its parent is found by the path it is cut from
export const buildSkeleton = (
  rigNodes: readonly AvatarRigNode[],
  bones: readonly RendererBone[],
): { nodeOfPath: Map<string, number>; nodes: AvatarBone[] } => {
  const nodes: AvatarBone[] = rigNodes.map(({ parent, path, position, rotation, scale }) => ({
    name: getFilename(path),
    parent,
    position: mirrorAvatarPoint(position),
    rotation: mirrorAvatarRotation(rotation),
    scale,
  }));
  const nodeOfPath = new Map(rigNodes.map(({ path }, node) => [path, node]));
  const pathObjectMap = new Map(bones.map(({ object, path }) => [path, object]));
  const sortedPathObjects = [...pathObjectMap.entries()].toSorted(([a], [b]) => depth(a) - depth(b));
  for (const [path, object] of sortedPathObjects) {
    if (nodeOfPath.has(path)) continue;
    const parent = nodeOfPath.get(path.slice(0, Math.max(path.lastIndexOf("/"), 0)));
    if (parent === undefined) throw new InvalidOperationError(Operation.Read, path, "has no ancestor in the rig");
    nodes.push(addedNode(object, parent, getFilename(path)));
    nodeOfPath.set(path, nodes.length - 1);
  }
  return { nodeOfPath, nodes };
};
