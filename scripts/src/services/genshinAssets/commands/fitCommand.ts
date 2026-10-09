import type { SubCommandsDef } from "citty";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { DerivedAssetFitMap } from "#src/services/genshinAssets/fit/DerivedAssetFitMap";
import { parseDerivedAssetComponent } from "#src/services/genshinAssets/shared/parseDerivedAssetComponent";
import { parseNames } from "#src/services/shared/parseNames";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { defineCommand } from "citty";

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
  },
  meta: {
    description: "Fit our own parameters to a component's exports and write them as the world's data",
    name: "fit",
  },
  run: async ({ args }) => {
    const only = args.only === undefined ? undefined : parseNames(args.only, "only");
    const component = parseDerivedAssetComponent(args.component);
    const fit = DerivedAssetFitMap[component];
    if (!fit) throw new InvalidOperationError(Operation.Read, component, "has no fit yet");
    console.log(await fit(only));
  },
});
