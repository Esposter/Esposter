import type { HookInput } from "#src/models/HookInput";

import { parseJsonObject } from "#src/services/parseJsonObject";

export const parseHookInput = (text: string): HookInput => {
  if (!text.trim()) return {};

  // The payload is the tool's to shape, so the fields read are each checked for their type
  const parsedInput = parseJsonObject(text);
  return {
    delta: typeof parsedInput.delta === "string" ? parsedInput.delta : "",
    final: typeof parsedInput.final === "boolean" ? parsedInput.final : false,
    index: typeof parsedInput.index === "number" && Number.isInteger(parsedInput.index) ? parsedInput.index : 0,
    message_id: typeof parsedInput.message_id === "string" ? parsedInput.message_id : "",
    session_id: typeof parsedInput.session_id === "string" ? parsedInput.session_id : "",
    turn_id: typeof parsedInput.turn_id === "string" ? parsedInput.turn_id : "",
  };
};
