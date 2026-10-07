import type { SubCommandsDef } from "citty";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { solveReferenceScroll } from "#src/services/genshinParity/witness/solveReferenceScroll";
import { parseNames } from "#src/services/shared/parseNames";
import { parseNumbers } from "#src/services/shared/parseNumbers";
import { defineCommand } from "citty";

export const scrollCommand: SubCommandsDef[string] = defineCommand({
  args: {
    families: { default: "Towers,Bridges", description: "The families moved along the glide together", type: "string" },
    reference: { description: "A reference's id in ParityReferenceMap", required: true, type: "positional" },
    scan: {
      default: "-100,100,2",
      description: "The distances along the glide scanned, in metres: from, to and the step, comma separated",
      type: "string",
    },
    witness: {
      description: "The component whose exports the witness draws",
      required: true,
      options: Object.values(DerivedAssetComponent),
      type: "enum",
    },
  },
  meta: {
    description:
      "How far the scene's scrolling rows stood from where it draws them in a reference's state, read off the families' edges at the reference's camera",
    name: "scroll",
  },
  run: async ({ args }) => {
    const [from = 0, to = 0, step = 1] = parseNumbers(args.scan, "scan", 3);
    const offsets = Array.from({ length: Math.floor((to - from) / step) + 1 }, (_offset, index) => from + index * step);
    const readings = await solveReferenceScroll(
      args.reference,
      args.witness,
      parseNames(args.families, "families"),
      offsets,
    );
    for (const { distance, offset } of readings) console.log(`${offset.toFixed(2)} m: ${distance.toFixed(2)} px`);
    const best = readings.reduce((least, reading) => (reading.distance < least.distance ? reading : least));
    console.log(`best: ${best.offset.toFixed(2)} m ahead at ${best.distance.toFixed(2)} px`);
  },
});
