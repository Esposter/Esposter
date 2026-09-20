import type { HookInput } from "#src/models/HookInput";

import { parseJsonObject } from "#src/services/parseJsonObject";

export const parseHookInput = (text: string): HookInput => {
  if (!text.trim()) return {};

  // The payload is the tool's to shape, so the two fields read are each checked for their type
  const parsedInput = parseJsonObject(text);
  return {
    last_assistant_message:
      typeof parsedInput.last_assistant_message === "string" ? parsedInput.last_assistant_message : "",
    session_id: typeof parsedInput.session_id === "string" ? parsedInput.session_id : "",
  };
};
