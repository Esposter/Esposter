import type { SubCommandsDef } from "citty";

import { DerivedAssetComponent } from "#src/models/genshinAssets/DerivedAssetComponent";
import { formatSerializedFields } from "#src/services/genshinAssets/formatSerializedFields";
import { parseDerivedAssetComponent } from "#src/services/genshinAssets/parseDerivedAssetComponent";
import { readComponentBehaviours } from "#src/services/genshinAssets/readComponentBehaviours";
import { defineCommand } from "citty";

export const behavioursCommand: SubCommandsDef[string] = defineCommand({
  args: {
    component: {
      description: `The component whose scripts to read: ${Object.values(DerivedAssetComponent).join(", ")}`,
      required: true,
      type: "positional",
    },
    script: {
      description: "Only the scripts whose names match this pattern, such as ^MonoLoginScene$",
      type: "string",
    },
  },
  meta: {
    description:
      "Export every MonoBehaviour of a component's layout blocks raw and print the fields their bytes' shapes read: pointers the component's data holds, curves, arrays, gradients, colours and scalars, each at its offset",
    name: "behaviours",
  },
  run: async ({ args }) => {
    const behaviours = await readComponentBehaviours(
      parseDerivedAssetComponent(args.component),
      args.script ? new RegExp(args.script, "u") : undefined,
    );
    console.log(
      behaviours
        .map(
          ({ block, describePointer, fields, file, script }) =>
            `${script} [${block} ${file}]\n${formatSerializedFields(fields, describePointer, 1)}`,
        )
        .join("\n"),
    );
  },
});
