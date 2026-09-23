import { getResult } from "@esposter/shared";
import { z } from "zod";

const sessionStartOutputSchema = z.object({ hookSpecificOutput: z.object({ additionalContext: z.string() }) });
// The context a session-start hook added, read from the JSON form of its stdout; a hook that printed anything else
// Added none a theme reads
export const getSessionStartContext = (stdout: string) =>
  getResult(() =>
    // oxlint-disable-next-line no-restricted-properties -- the session-start output schema validates the payload
    sessionStartOutputSchema.parse(JSON.parse(stdout)),
  ).match(
    ({ hookSpecificOutput }) => hookSpecificOutput.additionalContext,
    () => "",
  );
