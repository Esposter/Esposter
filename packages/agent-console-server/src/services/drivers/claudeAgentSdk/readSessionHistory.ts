import type { SessionMessage } from "@anthropic-ai/claude-agent-sdk";

import { getSessionMessages } from "@anthropic-ai/claude-agent-sdk";
import { InvalidOperationError, Operation } from "@esposter/shared";

// A session's transcript up to and including the message it is resumed at, or all of it when none is named. A
// Named message the transcript does not hold is refused, never read as the whole of it
export const readSessionHistory = async (
  sessionId: string,
  cwd: string,
  resumeAt: string,
): Promise<SessionMessage[]> => {
  // oxlint-disable-next-line id-denylist -- `dir` is the SDK's own option name
  const sessionMessages = await getSessionMessages(sessionId, { dir: cwd });
  if (!resumeAt) return sessionMessages;

  const resumeAtIndex = sessionMessages.findIndex(({ uuid }) => uuid === resumeAt);
  if (resumeAtIndex === -1)
    throw new InvalidOperationError(Operation.Read, sessionId, `the transcript holds no message ${resumeAt}`);
  return sessionMessages.slice(0, resumeAtIndex + 1);
};
