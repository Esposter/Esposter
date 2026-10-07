import type { SubCommandsDef } from "citty";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { formatSerializedFields } from "#src/services/genshinAssets/scene/formatSerializedFields";
import { readComponentBehaviours } from "#src/services/genshinAssets/scene/readComponentBehaviours";
import { parseDerivedAssetComponent } from "#src/services/genshinAssets/shared/parseDerivedAssetComponent";
import { parseNumbers } from "#src/services/shared/parseNumbers";
import { defineCommand } from "citty";

export const behavioursCommand: SubCommandsDef[string] = defineCommand({
  args: {
    component: {
      description: `The component whose scripts to read: ${Object.values(DerivedAssetComponent).join(", ")}`,
      required: true,
      type: "positional",
    },
    at: {
      description:
        "Times along the curves' and gradients' own axis to read each at, comma-separated, such as a day's hours as its fractions",
      type: "string",
    },
    script: {
      description: "Only the scripts whose names match this pattern, such as ^MonoLoginScene$",
      type: "string",
    },
  },
  meta: {
    description:
      "Export every MonoBehaviour, animator, camera and light of a component's layout blocks raw and print each on its game object with the fields their bytes' shapes read: pointers the component's data holds, curves, arrays, gradients, colours and scalars, each at its offset",
    name: "behaviours",
  },
  run: async ({ args }) => {
    const times = args.at ? parseNumbers(args.at, "at") : [];
    const behaviours = await readComponentBehaviours(
      parseDerivedAssetComponent(args.component),
      args.script ? new RegExp(args.script, "u") : undefined,
    );
    console.log(
      behaviours
        .map(
          ({ block, describePointer, fields, file, owner, script }) =>
            `${script} on ${owner} [${block} ${file}]\n${formatSerializedFields(fields, describePointer, 1, times)}`,
        )
        .join("\n"),
    );
  },
});
