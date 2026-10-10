import type { UsageTally } from "#src/models/usage/UsageTally";

import { accumulateTranscriptLines } from "#src/services/usage/accumulateTranscriptLines";
import { getTranscriptPrompt } from "#src/services/usage/getTranscriptPrompt";
import { getUsageBucket } from "#src/services/usage/getUsageBucket";
import { readProjectDirectories } from "#src/services/usage/readProjectDirectories";
import { readTranscriptFiles } from "#src/services/usage/readTranscriptFiles";
import { readFileSync } from "node:fs";

// Tallies every transcript of the matching projects written inside the window
// One tally spans them all, so a message repeated across files still counts once
export const readUsageTally = (project: string, sinceMs: number): UsageTally => {
  const tally: UsageTally = { seenIds: new Set(), totals: new Map(), transcripts: new Map() };
  for (const directory of readProjectDirectories(project))
    for (const path of readTranscriptFiles(directory, sinceMs)) {
      const lines = readFileSync(path, "utf8").split("\n");
      accumulateTranscriptLines(
        tally,
        { bucket: getUsageBucket(path), lines, path, prompt: getTranscriptPrompt(lines) },
        sinceMs,
      );
    }
  return tally;
};
