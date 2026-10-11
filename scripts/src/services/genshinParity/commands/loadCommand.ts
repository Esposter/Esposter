import type { SubCommandsDef } from "citty";

import { buildParityPage } from "#src/services/genshinParity/load/buildParityPage";
import { ScreenCrossingMap } from "#src/services/genshinParity/load/ScreenCrossingMap";
import { ScreenLoadBudgetMap } from "#src/services/genshinParity/load/ScreenLoadBudgetMap";
import { startParityServer } from "#src/services/genshinParity/load/startParityServer";
import { loadScreen } from "#src/services/genshinParity/page/loadScreen";
import { formatLoadMeter } from "#src/services/genshinParity/shared/formatLoadMeter";
import { InvalidOperationError, Operation, withFinalizerAsync } from "@esposter/shared";
import { defineCommand } from "citty";
import { hostname } from "node:os";

export const loadCommand: SubCommandsDef[string] = defineCommand({
  args: {
    screen: { description: "A screen with a fixture on the parity page", required: true, type: "positional" },
    width: { default: "1920", description: "Width to draw it at, in pixels", required: false, type: "positional" },
    crossing: {
      default: false,
      description:
        "Then measure the screen's crossing: moved once ready as its crossing names, what the move cost until it settled",
      required: false,
      type: "boolean",
    },
    dev: {
      default: false,
      description: "Measure the dev server instead of a production build, to compare the two",
      required: false,
      type: "boolean",
    },
    height: { default: "1080", description: "Height to draw it at, in pixels", required: false, type: "positional" },
    paused: {
      default: false,
      description:
        "Load the screen paused, as the app loads the world under its opening, drawing only the frames it asks for",
      required: false,
      type: "boolean",
    },
  },
  meta: {
    description:
      "A screen's load before it shows, measured on a production build of the parity page: the time to ready, the requests and game data fetched, and the renderer's and scene's counts, each against its budget",
    name: "load",
  },
  run: async ({ args }) => {
    const crossing = args.crossing ? ScreenCrossingMap[args.screen] : undefined;
    if (args.crossing && !crossing)
      throw new InvalidOperationError(Operation.Read, args.screen, "has no crossing in ScreenCrossingMap");
    // A paused screen draws only the frames it asks for, so nothing it streams after ready would settle
    if (crossing && args.paused)
      throw new InvalidOperationError(Operation.Read, args.screen, "cannot measure its crossing paused");
    if (!args.dev) buildParityPage();
    const { origin, stop } = await startParityServer(args.dev);
    const reading = await withFinalizerAsync(
      () =>
        loadScreen(
          {
            height: Number(args.height),
            pageRoot: `${origin}/parity/`,
            ...(args.paused && { props: { isPaused: true } }),
            ...(crossing && { props: crossing.fromProps }),
            screen: args.screen,
            width: Number(args.width),
          },
          crossing,
        ),
      stop,
    );
    const { isOver, lines } = formatLoadMeter(reading, ScreenLoadBudgetMap[args.screen], hostname());
    for (const line of lines) console.log(line);
    if (isOver) process.exitCode = 1;
  },
});
