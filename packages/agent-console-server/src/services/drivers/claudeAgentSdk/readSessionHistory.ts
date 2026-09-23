import type { SessionMessage } from "@anthropic-ai/claude-agent-sdk";

import { getSessionMessages } from "@anthropic-ai/claude-agent-sdk";
// A session's transcript up to and including the message it is resumed at, or all of it
export const readSessionHistory = async (
  sessionId: string,
  cwd: string,
  resumeAt: string,
): Promise<SessionMessage[]> => {
  // oxlint-disable-next-line id-denylist -- `dir` is the SDK's own option name
  const sessionMessages = await getSessionMessages(sessionId, { dir: cwd });
  const resumeAtIndex = resumeAt ? sessionMessages.findIndex(({ uuid }) => uuid === resumeAt) : -1;
  return resumeAtIndex === -1 ? sessionMessages : sessionMessages.slice(0, resumeAtIndex + 1);
};
