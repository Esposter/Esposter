import type { SceneTreeNode } from "#src/models/genshinAssets/SceneTreeNode";
import type { SubCommandsDef } from "citty";

import { DerivedAssetComponent } from "#src/models/genshinAssets/DerivedAssetComponent";
import { composeSceneTree } from "#src/services/genshinAssets/composeSceneTree";
import { formatSceneTree } from "#src/services/genshinAssets/formatSceneTree";
import { getComponentDirectory } from "#src/services/genshinAssets/getComponentDirectory";
import { parseDerivedAssetComponent } from "#src/services/genshinAssets/parseDerivedAssetComponent";
import { readSceneLayout } from "#src/services/genshinAssets/readSceneLayout";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { defineCommand } from "citty";

// Every node named so at any depth, or the node itself when it is
const findNodes = (node: SceneTreeNode, name: string): SceneTreeNode[] =>
  node.object.name === name ? [node] : node.children.flatMap((child) => findNodes(child, name));
const pruneNode = (node: SceneTreeNode, depth: number): SceneTreeNode => ({
  ...node,
  children: depth > 0 ? node.children.map((child) => pruneNode(child, depth - 1)) : [],
});

export const treeCommand: SubCommandsDef[string] = defineCommand({
  args: {
    block: { description: "Only the tops dumped from this block, such as 11790361", type: "string" },
    component: {
      description: `The component whose layout dumps to print: ${Object.values(DerivedAssetComponent).join(", ")}`,
      required: true,
      type: "positional",
    },
    depth: { description: "How many levels below each top to print (every level unless told)", type: "string" },
    root: {
      description: "Print the subtree of every object so named, at any depth, in place of the tops",
      type: "string",
    },
  },
  meta: {
    description:
      "Print a component's scene hierarchy from its layout dumps: each object's block, place, turn, scale and world scale, what it draws, its named components and children, flagging empty anchors, lost fathers and children, roots at the origin and meshes under several roots",
    name: "tree",
  },
  run: async ({ args }) => {
    const { gameObjectDrawingMap, objects } = await readSceneLayout(
      getComponentDirectory(parseDerivedAssetComponent(args.component)).layout,
    );
    const tops = composeSceneTree(objects, gameObjectDrawingMap).filter(
      ({ object }) => !args.block || object.block === args.block,
    );
    const { root } = args;
    const nodes = root ? tops.flatMap((top) => findNodes(top, root)) : tops;
    const depth = args.depth === undefined ? Infinity : Number(args.depth);
    // A depth that is no count would prune every child and pass the tops off as a flat hierarchy
    if (args.depth !== undefined && !(Number.isInteger(depth) && depth >= 0))
      throw new InvalidOperationError(Operation.Read, "depth", `not a whole number of levels: ${args.depth}`);
    console.log(nodes.map((node) => formatSceneTree(pruneNode(node, depth))).join("\n"));
  },
});
