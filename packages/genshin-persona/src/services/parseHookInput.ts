import type { HookInput } from "#src/models/HookInput";

export const parseHookInput = (text: string): HookInput => {
  if (!text.trim()) return {};

  // A plugin a stranger installs carries no `@esposter/shared`, and the payload holds no date: the two fields read
  // Are each checked for their type below
  // oxlint-disable-next-line no-restricted-properties
  const parsedInput = JSON.parse(text) as HookInput;
  return {
    last_assistant_message:
      typeof parsedInput.last_assistant_message === "string" ? parsedInput.last_assistant_message : "",
    session_id: typeof parsedInput.session_id === "string" ? parsedInput.session_id : "",
  };
};
