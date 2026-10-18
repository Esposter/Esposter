import type { SubCommandsDef } from "citty";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { dryRunArgs } from "#src/services/gameData/commands/dryRunArgs";
import { publishObjectsStep } from "#src/services/gameData/publishObjectsStep";
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
      description: "The fits to run alone, comma-separated, each named for the record it publishes (paving, towers)",
      type: "string",
    },
    ...dryRunArgs,
  },
  meta: {
    description:
      "Fit our own parameters to a component's exports and publish each as the world's record under its own key",
    name: "fit",
  },
  run: async ({ args }) => {
    const only = args.only === undefined ? [] : parseNames(args.only, "only");
    const component = parseDerivedAssetComponent(args.component);
    const fit = DerivedAssetFitMap[component];
    if (!fit) throw new InvalidOperationError(Operation.Read, component, "has no fit yet");
    const { notes, objects } = await fit(only, { isDryRun: args["dry-run"] });
    for (const note of notes) console.log(note);
    console.log(await publishObjectsStep({ isDryRun: args["dry-run"], objects }));
  },
});
