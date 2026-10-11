import { McpScope } from "#shared/models/auth/McpScope";

export const McpScopeTitleMap = {
  [McpScope.FollowUps]: "Follow-ups",
  [McpScope.Resources]: "Resources",
} as const satisfies Record<McpScope, string>;
