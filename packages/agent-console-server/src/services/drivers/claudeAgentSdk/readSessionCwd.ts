import { getSessionInfo } from "@anthropic-ai/claude-agent-sdk";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The directory a session on disk was run in, which is what reopening it needs
export const readSessionCwd = async (sessionId: string): Promise<string> => {
  const sessionInfo = await getSessionInfo(sessionId);
  if (!sessionInfo?.cwd) throw new InvalidOperationError(Operation.Read, sessionId, "no session with this id on disk");
  return sessionInfo.cwd;
};
