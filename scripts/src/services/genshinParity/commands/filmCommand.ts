import type { SubCommandsDef } from "citty";

import { parseDerivedAssetComponent } from "#src/services/genshinAssets/parseDerivedAssetComponent";
import { filmScreen } from "#src/services/genshinParity/filmScreen";
import { jsonDateParse } from "@esposter/shared";
import { defineCommand } from "citty";

export const filmCommand: SubCommandsDef[string] = defineCommand({
  args: {
    screen: { description: "A screen with a fixture on the parity page", required: true, type: "positional" },
    seconds: { description: "Seconds to film, from the moment it is ready", required: true, type: "positional" },
    at: {
      description: 'Props set at moments, as JSON by milliseconds: {"2000":{"stage":"Preparing"}}',
      type: "string",
    },
    beside: {
      description: "A recording to lay each still over, at the same moments, as source@second",
      type: "string",
    },
    fps: { default: "2", description: "Stills a second, as `frames` samples a recording", type: "string" },
    height: { default: "540", description: "Height to draw it at, in pixels", type: "string" },
    props: { description: "Props over the fixture's from the start, as JSON", type: "string" },
    width: { default: "960", description: "Width to draw it at, in pixels", type: "string" },
    witness: { description: "A component whose exports are drawn in place of the scene's own parts", type: "string" },
  },
  meta: {
    description: "A screen's motion on a faked clock, as stills at exact moments and a contact sheet",
    name: "film",
  },
  run: async ({ args }) => {
    const [besideSource = "", besideStart = "0"] = args.beside?.split("@") ?? [];
    await filmScreen({
      beside: args.beside ? { source: besideSource, startSeconds: Number(besideStart) } : undefined,
      durationMs: Number(args.seconds) * 1000,
      height: Number(args.height),
      props: args.props ? jsonDateParse<Record<string, unknown>>(args.props) : undefined,
      propsAt: args.at ? jsonDateParse<Record<string, Record<string, unknown>>>(args.at) : undefined,
      screen: args.screen,
      stepMs: 1000 / Number(args.fps),
      width: Number(args.width),
      witness: args.witness ? parseDerivedAssetComponent(args.witness) : undefined,
    });
  },
});
