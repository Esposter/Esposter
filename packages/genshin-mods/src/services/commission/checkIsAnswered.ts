import type { ToolCallResult } from "claude-code";

// A task tool's call is folded in only once the tool has answered: a denial or an error leaves the commission as it was
export const checkIsAnswered = ({ deny, isError }: Pick<ToolCallResult, "deny" | "isError">): boolean =>
  !deny && !isError;
