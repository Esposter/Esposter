import type { SubCommandsDef } from "citty";

import { benchScreen } from "#src/services/genshinParity/page/benchScreen";
import { jsonDateParse } from "@esposter/shared";
import { defineCommand } from "citty";

export const benchCommand: SubCommandsDef[string] = defineCommand({
  args: {
    screen: { description: "A screen with a fixture on the parity page", required: true, type: "positional" },
    width: { default: "1920", description: "Width to draw it at, in pixels", required: false, type: "positional" },
    height: { default: "1080", description: "Height to draw it at, in pixels", required: false, type: "positional" },
    frames: { default: "300", description: "Frames to time", type: "string" },
    props: { description: "Props over the fixture's, as JSON", type: "string" },
    warm: { default: "3000", description: "Milliseconds drawn before timing, while pipelines compile", type: "string" },
  },
  meta: {
    description: "A scene's frame time, its main thread's share, and the renderer's draw calls and kept resources",
    name: "bench",
  },
  run: async ({ args }) => {
    await benchScreen({
      frameCount: Number(args.frames),
      height: Number(args.height),
      props: args.props ? jsonDateParse<Record<string, unknown>>(args.props) : undefined,
      screen: args.screen,
      warmMs: Number(args.warm),
      width: Number(args.width),
    });
  },
});
