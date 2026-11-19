import type { SubCommandsDef } from "citty";

import { AssetType } from "#src/models/genshinAssets/shared/AssetType";
import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { readMeshBounds } from "#src/services/genshinAssets/bounds/readMeshBounds";
import { formatMeasurement } from "#src/services/genshinAssets/commands/formatMeasurement";
import { getComponentDirectory } from "#src/services/genshinAssets/shared/getComponentDirectory";
import { parseDerivedAssetComponent } from "#src/services/genshinAssets/shared/parseDerivedAssetComponent";
import { defineCommand } from "citty";
import { join } from "node:path";

const AXES = [
  ["x", 0],
  ["y", 1],
  ["z", 2],
] as const;

export const boundsCommand: SubCommandsDef[string] = defineCommand({
  args: {
    component: {
      description: `The component whose exported mesh to read: ${Object.values(DerivedAssetComponent).join(", ")}`,
      required: true,
      type: "positional",
    },
    name: {
      description: "The mesh's name, as its exported OBJ is named in the component's Mesh folder",
      required: true,
      type: "positional",
    },
  },
  meta: {
    description:
      "Read a named mesh's bounds from its exported OBJ and print each axis's lowest and highest vertex and its size, in metres",
    name: "bounds",
  },
  run: async ({ args }) => {
    const { assets } = getComponentDirectory(parseDerivedAssetComponent(args.component));
    const { maximum, minimum } = await readMeshBounds(join(assets, AssetType.Mesh, `${args.name}.obj`));
    for (const [axisName, axis] of AXES)
      console.log(
        `${axisName}: ${formatMeasurement(minimum[axis])} to ${formatMeasurement(maximum[axis])} m, size ${formatMeasurement(maximum[axis] - minimum[axis])} m`,
      );
  },
});
