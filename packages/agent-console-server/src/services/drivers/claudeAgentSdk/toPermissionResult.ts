import type { PermissionResult, PermissionUpdate } from "@anthropic-ai/claude-agent-sdk";

import { PermissionBehavior } from "#src/models/command/PermissionBehavior";
import { DEFAULT_DENY_MESSAGE } from "#src/services/drivers/claudeAgentSdk/constants";
import { exhaustiveGuard } from "@esposter/shared";

// The page's verdict as the SDK's answer: always-allow applies the rules the SDK offered with the prompt, the
// Same choice the terminal's "don't ask again" makes
export const toPermissionResult = (
  input: Record<string, unknown>,
  suggestions: PermissionUpdate[],
  behavior: PermissionBehavior,
  message: string,
): PermissionResult => {
  switch (behavior) {
    case PermissionBehavior.Allow:
      return { behavior: "allow", updatedInput: input };
    case PermissionBehavior.AllowAlways:
      return { behavior: "allow", updatedInput: input, updatedPermissions: suggestions };
    case PermissionBehavior.Deny:
      return { behavior: "deny", message: message || DEFAULT_DENY_MESSAGE };
    default:
      return exhaustiveGuard(behavior);
  }
};
