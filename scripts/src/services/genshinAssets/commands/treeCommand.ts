import type { SubCommandsDef } from "citty";

import { SceneTreeFlag } from "#src/models/genshinAssets/scene/SceneTreeFlag";
import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { findNodes } from "#src/services/genshinAssets/commands/findNodes";
import { parseTreeDepth } from "#src/services/genshinAssets/commands/parseTreeDepth";
import { pruneNode } from "#src/services/genshinAssets/commands/pruneNode";
import { RegionCapitalMap } from "#src/services/genshinAssets/fit/RegionCapitalMap";
import { composeSceneTree } from "#src/services/genshinAssets/scene/composeSceneTree";
import { formatSceneTree } from "#src/services/genshinAssets/scene/formatSceneTree";
import { parseDerivedAssetComponent } from "#src/services/genshinAssets/shared/parseDerivedAssetComponent";
import { readComponentLayout } from "#src/services/genshinAssets/shared/readComponentLayout";
import { readComponentPlacements } from "#src/services/genshinAssets/shared/readComponentPlacements";
import { ARCHITECTURE_VIEW_METRES } from "#src/services/genshinAssets/world/constants";
import { readCapitalWorldPlace } from "#src/services/genshinAssets/world/readCapitalWorldPlace";
import { selectArchitectureInView } from "#src/services/genshinAssets/world/selectArchitectureInView";
import { selectLostArchitectureInView } from "#src/services/genshinAssets/world/selectLostArchitectureInView";
import { defineCommand } from "citty";

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
      "Print a component's scene hierarchy from its layout dumps, each spawned prefab under its anchor: each object's block, place, turn, scale and world scale, what it draws, its named components and children, flagging empty anchors, lost fathers and children, roots at the origin and meshes under several roots",
    name: "tree",
  },
  run: async ({ args }) => {
    const component = parseDerivedAssetComponent(args.component);
    const { gameObjectDrawingMap, objects } = await readComponentLayout(component);
    const allTops = composeSceneTree(objects, gameObjectDrawingMap);
    const tops = allTops.filter(({ object }) => !args.block || object.block === args.block);
    const { root } = args;
    const nodes = root ? tops.flatMap((top) => findNodes(top, root)) : tops;
    const depth = parseTreeDepth(args.depth);
    // Unplaced spawns are counted apart from the lost fathers they would otherwise be, and a capital's bar reads the
    // Architecture among the lost fathers in its view against the architecture the witness places there
    const unplacedSpawnCount = allTops.filter(({ flags }) => flags.includes(SceneTreeFlag.TopAtOrigin)).length;
    const lostFathers = allTops
      .filter(({ flags }) => flags.includes(SceneTreeFlag.LostFather) && !flags.includes(SceneTreeFlag.TopAtOrigin))
      .map(({ object }) => object);
    const lines = [
      ...nodes.map((node) => formatSceneTree(pruneNode(node, depth))),
      `unplaced spawns: ${unplacedSpawnCount} tops collapsed at the origin, dropped from the witness`,
      `lost fathers: ${lostFathers.length}`,
    ];
    if (RegionCapitalMap[component]) {
      const place = await readCapitalWorldPlace(component);
      const placements = await readComponentPlacements(component, { isCopied: true });
      lines.push(
        `architecture placed within ${ARCHITECTURE_VIEW_METRES} metres of the capital: ${selectArchitectureInView(placements, place).length}`,
        `architecture lost fathers within ${ARCHITECTURE_VIEW_METRES} metres of the capital: ${selectLostArchitectureInView(lostFathers, place).length}`,
      );
    }
    console.log(lines.join("\n"));
  },
});
