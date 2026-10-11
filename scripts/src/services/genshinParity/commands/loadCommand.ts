import type { SubCommandsDef } from "citty";

import { buildParityPage } from "#src/services/genshinParity/load/buildParityPage";
import { ScreenLoadBudgetMap } from "#src/services/genshinParity/load/ScreenLoadBudgetMap";
import { startParityPreview } from "#src/services/genshinParity/load/startParityPreview";
import { loadScreen } from "#src/services/genshinParity/page/loadScreen";
import { formatLoadMeter } from "#src/services/genshinParity/shared/formatLoadMeter";
import { withFinalizerAsync } from "@esposter/shared";
import { defineCommand } from "citty";
import { hostname } from "node:os";

export const loadCommand: SubCommandsDef[string] = defineCommand({
  args: {
    screen: { description: "A screen with a fixture on the parity page", required: true, type: "positional" },
    width: { default: "1920", description: "Width to draw it at, in pixels", required: false, type: "positional" },
    height: { default: "1080", description: "Height to draw it at, in pixels", required: false, type: "positional" },
  },
  meta: {
    description:
      "A screen's load before it shows, measured on a production build of the parity page: the time to ready, the requests and game data fetched, and the renderer's and scene's counts, each against its budget",
    name: "load",
  },
  run: async ({ args }) => {
    buildParityPage();
    const { origin, stop } = await startParityPreview();
    const reading = await withFinalizerAsync(
      () =>
        loadScreen({
          height: Number(args.height),
          pageRoot: `${origin}/parity/`,
          screen: args.screen,
          width: Number(args.width),
        }),
      stop,
    );
    const { isOver, lines } = formatLoadMeter(reading, ScreenLoadBudgetMap[args.screen], hostname());
    for (const line of lines) console.log(line);
    if (isOver) process.exitCode = 1;
  },
});
