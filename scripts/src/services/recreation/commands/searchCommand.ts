import type { SearchCandidate } from "#src/models/recreation/video/SearchCandidate";
import type { SubCommandsDef } from "citty";

import { VideoSite } from "#src/models/recreation/video/VideoSite";
import { searchVideos } from "#src/services/recreation/video/searchVideos";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { defineCommand } from "citty";

const formatClock = (seconds: number): string =>
  `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;

const formatCandidate = (candidate: SearchCandidate): string[] => {
  const resolution = candidate.height === undefined ? undefined : `${candidate.height}p${candidate.fps ?? ""}`;
  const details = [
    candidate.title,
    candidate.uploader,
    candidate.durationSeconds === undefined ? undefined : formatClock(candidate.durationSeconds),
    resolution,
    candidate.uploadDate,
  ].filter((detail) => detail !== undefined);
  const chapters = (candidate.chapters ?? []).map(
    (chapter) => `  ${formatClock(chapter.startSeconds)} ${chapter.title}`,
  );
  return [candidate.url, details.join(" · "), ...chapters];
};

const checkIsVideoSite = (site: string): site is VideoSite => Object.values<string>(VideoSite).includes(site);

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
