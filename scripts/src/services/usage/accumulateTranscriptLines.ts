import type { UsageTally } from "#src/models/usage/UsageTally";
import type { UsageTotal } from "#src/models/usage/UsageTotal";
import type { UsageTranscript } from "#src/models/usage/UsageTranscript";

import { addUsageTurn } from "#src/services/usage/addUsageTurn";
import { SYNTHETIC_MODEL, USAGE_MARKER } from "#src/services/usage/constants";
import { getUsageFamily } from "#src/services/usage/getUsageFamily";
import { readTranscriptLine } from "#src/services/usage/readTranscriptLine";
import { ID_SEPARATOR } from "@esposter/shared";

// Counts a transcript's assistant turns in the window into the tally;
// Streaming writes one message as several lines, so a message is counted once, by its message id and request id
export const accumulateTranscriptLines = (tally: UsageTally, transcript: UsageTranscript, sinceMs: number): void => {
  for (const line of transcript.lines) {
    if (!line.includes(USAGE_MARKER)) continue;
    const transcriptLine = readTranscriptLine(line);
    const message = transcriptLine?.message;
    if (transcriptLine?.timestamp === undefined || message?.model === undefined || message.usage === undefined)
      continue;
    if (message.model === SYNTHETIC_MODEL || Date.parse(transcriptLine.timestamp) < sinceMs) continue;
    const seenId = `${message.id ?? ""}${ID_SEPARATOR}${transcriptLine.requestId ?? ""}`;
    if (tally.seenIds.has(seenId)) continue;
    tally.seenIds.add(seenId);
    const family = getUsageFamily(message.model);
    const input = message.usage.input_tokens ?? 0;
    const cacheRead = message.usage.cache_read_input_tokens ?? 0;
    const cacheWrite = message.usage.cache_creation_input_tokens ?? 0;
    const turn: UsageTotal = {
      bucket: transcript.bucket,
      cacheRead,
      cacheWrite,
      context: input + cacheRead + cacheWrite,
      family,
      output: message.usage.output_tokens ?? 0,
      turns: 1,
    };
    addUsageTurn(tally.totals, `${transcript.bucket}${ID_SEPARATOR}${family}`, turn);
    addUsageTurn(tally.transcripts, `${transcript.path}${ID_SEPARATOR}${family}`, {
      ...turn,
      path: transcript.path,
      prompt: transcript.prompt,
    });
  }
};
