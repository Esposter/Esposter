import type { SubCommandsDef } from "citty";

import { checkIsVideoSite } from "#src/services/recreation/video/checkIsVideoSite";
import { formatCandidate } from "#src/services/recreation/video/formatCandidate";
import { searchVideos } from "#src/services/recreation/video/searchVideos";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { defineCommand } from "citty";

export const searchCommand: SubCommandsDef[string] = defineCommand({
  args: {
    count: { default: "10", description: "How many videos to list", required: false, type: "string" },
    query: { description: "What the videos are searched for", required: true, type: "positional" },
    site: {
      default: "youtube",
      description: "The site searched: youtube or bilibili",
      required: false,
      type: "string",
    },
  },
  meta: {
    description:
      "The public videos a query finds on YouTube or Bilibili, each with its length, resolution and chapters",
    name: "search",
  },
  run: async ({ args }) => {
    if (!checkIsVideoSite(args.site)) throw new InvalidOperationError(Operation.Read, args.site, "is not a video site");
    const candidates = await searchVideos(args.site, Number(args.count), args.query);
    for (const candidate of candidates) console.log(formatCandidate(candidate).join("\n"));
  },
});
