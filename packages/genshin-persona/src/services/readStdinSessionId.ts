import { parseHookInput } from "#src/services/parseHookInput";
import { readStdin } from "#src/services/readStdin";

export const readStdinSessionId = async (): Promise<string> => {
  const { session_id: sessionId = "" } = parseHookInput(await readStdin());
  return sessionId;
};
