import type { SubCommandsDef } from "citty";

import { DerivedAssetComponent } from "#src/models/genshinAssets/DerivedAssetComponent";
import { extractComponentPlaylist } from "#src/services/genshinAssets/extractComponentPlaylist";
import { parseDerivedAssetComponent } from "#src/services/genshinAssets/parseDerivedAssetComponent";
import { defineCommand } from "citty";

const formatSeconds = (milliseconds: number): string => `${(milliseconds / 1000).toFixed(3)} s`;

export const playlistCommand: SubCommandsDef[string] = defineCommand({
  args: {
    component: {
      description: `The component whose music to export: ${Object.values(DerivedAssetComponent).join(", ")}`,
      required: true,
      type: "positional",
    },
  },
  meta: {
    description: "Export a component's music playlist in the order it plays, with each source it plays decoded",
    name: "playlist",
  },
  run: async ({ args }) => {
    const { isLooping, order, segments } = await extractComponentPlaylist(parseDerivedAssetComponent(args.component));
    for (const index of order) {
      const segment = segments[index];
      if (!segment) continue;
      const clips = segment.clips.map(
        ({ beginTrim, endTrim, playAt, sourceId }) =>
          `${sourceId} at ${formatSeconds(playAt)}, trimmed ${formatSeconds(beginTrim)} and ${formatSeconds(endTrim)}`,
      );
      console.log(`segment ${segment.id}: ${formatSeconds(segment.duration)}, ${clips.join("; ") || "silent"}`);
    }
    console.log(isLooping ? "then loops forever" : "then ends");
  },
});
