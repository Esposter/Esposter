import type { TranscriptLine } from "#src/models/usage/TranscriptLine";

import { transcriptLineSchema } from "#src/models/usage/TranscriptLine";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { getResult } from "@esposter/shared";

// A line the session is still writing is not complete JSON yet, so it is left out and counted on the next run
export const readTranscriptLine = (line: string): TranscriptLine | undefined =>
  getResult(() => transcriptLineSchema.parse(parseMachineJson(line))).match(
    (transcriptLine) => transcriptLine,
    () => undefined,
  );
