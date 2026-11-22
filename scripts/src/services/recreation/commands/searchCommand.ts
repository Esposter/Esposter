import type { SubCommandsDef } from "citty";

import { VideoSite } from "#src/models/recreation/video/VideoSite";
import { formatCandidate } from "#src/services/recreation/video/formatCandidate";
import { searchVideos } from "#src/services/recreation/video/searchVideos";
import { defineCommand } from "citty";

export const searchCommand: SubCommandsDef[string] = defineCommand({
  args: {
    count: { default: "10", description: "How many videos to list", required: false, type: "string" },
    query: { description: "What the videos are searched for", required: true, type: "positional" },
    site: {
      default: VideoSite.Youtube,
      description: "The site searched: youtube or bilibili",
      options: Object.values(VideoSite),
      type: "enum",
    },
  },
  meta: {
    description:
      "The public videos a query finds on YouTube or Bilibili, each with its length, resolution and chapters",
    name: "search",
  },
  run: async ({ args }) => {
    const candidates = await searchVideos(args.site, Number(args.count), args.query);
    for (const candidate of candidates) console.log(formatCandidate(candidate).join("\n"));
  },
});
