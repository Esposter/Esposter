import type { TranscriptUsage } from "#src/models/usage/TranscriptUsage";

import { formatFleetTable } from "#src/services/fleet/formatFleetTable";
import { TOP_TRANSCRIPT_COUNT } from "#src/services/usage/constants";
import { formatMillions } from "#src/services/usage/formatMillions";
import { formatPromptPreview } from "#src/services/usage/formatPromptPreview";

// The transcripts with the most cached reads, each with the start of the prompt that opened it
export const formatTranscriptRows = (transcripts: readonly TranscriptUsage[]): string[] =>
  formatFleetTable(
    ["bucket", "family", "turns", "cached reads", "prompt"],
    transcripts
      .toSorted((firstTranscript, secondTranscript) => secondTranscript.cacheRead - firstTranscript.cacheRead)
      .slice(0, TOP_TRANSCRIPT_COUNT)
      .map(({ bucket, cacheRead, family, prompt, turns }) => [
        bucket,
        family,
        String(turns),
        formatMillions(cacheRead),
        formatPromptPreview(prompt),
      ]),
  );
