import type { SubCommandsDef } from "citty";

import { measureStalls } from "#src/services/genshinParity/shared/measureStalls";
import { defineCommand } from "citty";

const SIZE_SEPARATOR = "x";

export const stallsCommand: SubCommandsDef[string] = defineCommand({
  args: {
    screen: { description: "A screen with a fixture on the parity page", required: true, type: "positional" },
    scale: { default: "1", description: "The device's pixel ratio the page is drawn at", type: "string" },
    size: {
      default: `1600${SIZE_SEPARATOR}900`,
      description: "The viewport in CSS pixels, as WIDTHxHEIGHT",
      type: "string",
    },
  },
  meta: {
    description:
      "The frame stalls of the parity page's screen: a cold orbit, a second orbit and a walk, with the programs held",
    name: "stalls",
  },
  run: async ({ args }) => {
    const [width = 0, height = 0] = args.size.split(SIZE_SEPARATOR).map(Number);
    console.log(await measureStalls({ height, scale: Number(args.scale), screen: args.screen, width }));
  },
});
