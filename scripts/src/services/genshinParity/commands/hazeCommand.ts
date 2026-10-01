import type { SubCommandsDef } from "citty";

import { parseDerivedAssetComponent } from "#src/services/genshinAssets/parseDerivedAssetComponent";
import { readReferenceHaze } from "#src/services/genshinParity/readReferenceHaze";
import { defineCommand } from "citty";

const format = (color: number[]): string => color.map((value) => value.toFixed(3)).join(",");

export const hazeCommand: SubCommandsDef[string] = defineCommand({
  args: {
    reference: { description: "A reference's id in ParityReferenceMap", required: true, type: "positional" },
    witness: {
      description: "The component whose exports mark the parts and their depths",
      required: true,
      type: "string",
    },
  },
  meta: {
    description:
      "Each depth band's median colour over the parts, the reference's beside ours without its fog and with it",
    name: "haze",
  },
  run: async ({ args }) => {
    for (const { clear, count, far, hazed, near, reference } of await readReferenceHaze(
      args.reference,
      parseDerivedAssetComponent(args.witness),
    ))
      console.log(
        `${near}-${far} m (${count} px): reference ${format(reference)}, ours clear ${format(clear)}, hazed ${format(hazed)}`,
      );
  },
});
