import type { SubCommandsDef } from "citty";

import { parseTreeDepth } from "#src/services/genshinAssets/commands/parseTreeDepth";
import { composeInterfaceTree } from "#src/services/genshinAssets/interface/composeInterfaceTree";
import { findNearestUiCanvas } from "#src/services/genshinAssets/ui/findNearestUiCanvas";
import { getUiRootEntries } from "#src/services/genshinAssets/ui/getUiRootEntries";
import { readUiBlockEntries } from "#src/services/genshinAssets/ui/readUiBlockEntries";
import { readUiBlockIndex } from "#src/services/genshinAssets/ui/readUiBlockIndex";
import { resolveUiBlock } from "#src/services/genshinAssets/ui/resolveUiBlock";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { defineCommand } from "citty";

export const uiTreeCommand: SubCommandsDef[string] = defineCommand({
  args: {
    block: {
      description: "The block holding the container, such as 04949489 or 00/04949489.blk",
      required: true,
      type: "positional",
    },
    container: {
      description: "The container, a prefab, whose RectTransform tree to print, as `ui-find` prints it",
      required: true,
      type: "positional",
    },
    depth: { description: "How many levels below each root to print (every level unless told)", type: "string" },
  },
  meta: {
    description:
      "Print one container's RectTransform tree as compact JSON: each piece's anchors, pivot, position, size, scale, components and children, with the settings of the nearest canvas scaler",
    name: "ui-tree",
  },
  run: async ({ args }) => {
    const block = await resolveUiBlock(args.block);
    const entries = (await readUiBlockEntries(await readUiBlockIndex(block))).filter(
      ({ container }) => container === args.container,
    );
    if (entries.length === 0)
      throw new InvalidOperationError(Operation.Read, args.container, `holds no RectTransform in ${block}`);
    const depth = parseTreeDepth(args.depth);
    const roots = getUiRootEntries(entries).map((root) => composeInterfaceTree(entries, root, depth));
    const canvas = findNearestUiCanvas(roots);
    console.log(
      JSON.stringify({
        block,
        container: args.container,
        ...(canvas ? { canvas: canvas.canvas, canvasPath: canvas.path } : {}),
        roots,
      }),
    );
  },
});
