import type { SubCommandsDef } from "citty";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { formatSecondsThreeDecimals } from "#src/services/genshinAssets/commands/formatSecondsThreeDecimals";
import { extractComponentPlaylist } from "#src/services/genshinAssets/music/extractComponentPlaylist";
import { parseDerivedAssetComponent } from "#src/services/genshinAssets/shared/parseDerivedAssetComponent";
import { defineCommand } from "citty";

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
          `${sourceId} at ${formatSecondsThreeDecimals(playAt)}, trimmed ${formatSecondsThreeDecimals(beginTrim)} and ${formatSecondsThreeDecimals(endTrim)}`,
      );
      console.log(
        `segment ${segment.id}: ${formatSecondsThreeDecimals(segment.duration)} at ${segment.volume.toFixed(1)} dB, ${clips.join("; ") || "silent"}`,
      );
    }
    console.log(isLooping ? "then loops forever" : "then ends");
  },
});
