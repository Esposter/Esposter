import type { SubCommandsDef } from "citty";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { DerivedAssetFitMap } from "#src/services/genshinAssets/fit/DerivedAssetFitMap";
import { parseDerivedAssetComponent } from "#src/services/genshinAssets/shared/parseDerivedAssetComponent";
import { parseNames } from "#src/services/shared/parseNames";
import { parseNumbers } from "#src/services/shared/parseNumbers";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { defineCommand } from "citty";

// A radial profile needs three angles to enclose the area its outline is read off
const MIN_ANGLE_COUNT = 3;

export const fitCommand: SubCommandsDef[string] = defineCommand({
  args: {
    component: {
      description: `The component to fit: ${Object.values(DerivedAssetComponent).join(", ")}`,
      required: true,
      type: "positional",
    },
    only: {
      description: "The fits to run alone, comma-separated, each named for the data file it writes (paving, towers)",
      type: "string",
    },
    angles: {
      description: "The angles a statue's radial profile reads at, a whole count of 3 or more (the statue alone)",
      type: "string",
    },
  },
  meta: {
    description: "Fit our own parameters to a component's exports and write them as the world's data",
    name: "fit",
  },
  run: async ({ args }) => {
    const only = args.only === undefined ? undefined : parseNames(args.only, "only");
    const angleCount = args.angles === undefined ? undefined : parseNumbers(args.angles, "angles", 1)[0];
    if (angleCount !== undefined && (!Number.isInteger(angleCount) || angleCount < MIN_ANGLE_COUNT))
      throw new InvalidOperationError(Operation.Read, "angles", `${args.angles} is not a whole count of 3 or more`);
    const component = parseDerivedAssetComponent(args.component);
    const fit = DerivedAssetFitMap[component];
    if (!fit) throw new InvalidOperationError(Operation.Read, component, "has no fit yet");
    console.log(await fit(only, angleCount));
  },
});
