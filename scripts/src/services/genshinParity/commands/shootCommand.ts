import type { SubCommandsDef } from "citty";

import { ParityMotion } from "#src/models/genshinParity/shared/ParityMotion";
import { shootScreen } from "#src/services/genshinParity/shared/shootScreen";
import { defineCommand } from "citty";

export const shootCommand: SubCommandsDef[string] = defineCommand({
  args: {
    screen: { description: "A screen with a fixture on the parity page", required: true, type: "positional" },
    width: { description: "Width to draw it at, in pixels", required: true, type: "positional" },
    height: { description: "Height to draw it at, in pixels", required: true, type: "positional" },
    motion: {
      default: ParityMotion.Props,
      description: "The motion held at each time: the screen's entry, or its fixture's motion props",
      options: Object.values(ParityMotion),
      type: "enum",
    },
  },
  meta: {
    description: "The parity page's screen at a size, its motion held at each time in milliseconds given after it",
    name: "shoot",
  },
  run: ({ args }) =>
    shootScreen({
      height: Number(args.height),
      motion: args.motion,
      screen: args.screen,
      timesMs: args._.slice(3).map(Number),
      width: Number(args.width),
    }),
});
