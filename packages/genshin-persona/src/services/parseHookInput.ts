import type { HookInput } from "#src/models/HookInput";

import { parseJsonObject } from "#src/services/parseJsonObject";

export const parseHookInput = (text: string): HookInput => {
  if (!text.trim()) return {};

  // The payload is the tool's to shape, so the fields read are each checked for their type
  const parsedInput = parseJsonObject(text);
  return {
    delta: typeof parsedInput.delta === "string" ? parsedInput.delta : "",
    session_id: typeof parsedInput.session_id === "string" ? parsedInput.session_id : "",
    turn_id: typeof parsedInput.turn_id === "string" ? parsedInput.turn_id : "",
  };
};
