import type { SubCommandsDef } from "citty";

import { loadScreen } from "#src/services/genshinParity/page/loadScreen";
import { formatLoadMeter } from "#src/services/genshinParity/shared/formatLoadMeter";
import { defineCommand } from "citty";
import { ScreenLoadBudgetMap } from "#src/services/genshinParity/load/ScreenLoadBudgetMap";
import { hostname } from "node:os";

export const loadCommand: SubCommandsDef[string] = defineCommand({
  args: {
    screen: { description: "A screen with a fixture on the parity page", required: true, type: "positional" },
    width: { default: "1920", description: "Width to draw it at, in pixels", required: false, type: "positional" },
    height: { default: "1080", description: "Height to draw it at, in pixels", required: false, type: "positional" },
  },
  meta: {
    description:
      "A screen's load before it shows: the time to ready, the requests and game data fetched, and the renderer's and scene's counts, each against its budget",
    name: "load",
  },
  run: async ({ args }) => {
    const reading = await loadScreen({ height: Number(args.height), screen: args.screen, width: Number(args.width) });
    const { isFailed, lines } = formatLoadMeter(reading, ScreenLoadBudgetMap[args.screen], hostname());
    for (const line of lines) console.log(line);
    if (isFailed) process.exitCode = 1;
  },
});
