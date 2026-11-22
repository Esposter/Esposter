import type { TranscriptLine } from "#src/models/usage/TranscriptLine";

import { transcriptLineSchema } from "#src/models/usage/TranscriptLine";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { getResult } from "@esposter/shared";

// A line the session is still writing is not complete JSON yet, so it is left out and counted on the next run;
// A complete line the schema refuses is logged, since a later run would refuse it again and never count it
export const readTranscriptLine = (line: string): TranscriptLine | undefined =>
  getResult(() => parseMachineJson(line))
    .andThen((json) => getResult(() => transcriptLineSchema.parse(json)).orTee(console.error))
    .unwrapOr(undefined);
