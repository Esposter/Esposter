import type { SceneTreeNode } from "#src/models/genshinAssets/SceneTreeNode";

import { formatNumbers } from "#src/services/genshinAssets/formatNumbers";
import { formatTree } from "#src/services/genshinAssets/formatTree";

// A scene's tree as text, one object a line indented by its depth: its name and block, its local position, its turn
// And scale where they are not the identity's, its scale in the world, what it draws, its named components, how many children
// It names, and what its arrangement flags
export const formatSceneTree = (node: SceneTreeNode): string =>
  formatTree(node, ({ children, flags, mesh, object, worldScale }) => {
    const { block, childIds, components, name, position, rotation, scale } = object;
    const parts = [`${name} [${block}] at ${formatNumbers(position)}`];
    if (rotation.some((value, index) => value !== (index === 3 ? 1 : 0))) parts.push(`turn ${formatNumbers(rotation)}`);
    if (scale.some((value) => value !== 1)) parts.push(`scale ${formatNumbers(scale)}`);
    parts.push(`world scale ${formatNumbers(worldScale)}`);
    if (mesh) parts.push(`draws ${mesh}`);
    if (components.length > 0) parts.push(`components ${components.join(" ")}`);
    if (childIds.length > 0)
      parts.push(
        children.length === childIds.length
          ? `${childIds.length} children`
          : `${childIds.length} children, ${children.length} dumped`,
      );
    return flags.length > 0 ? `${parts.join(", ")}: ${flags.join(", ")}` : parts.join(", ");
  });
