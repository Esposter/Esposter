import { McpScope } from "@esposter/db-schema";

export const McpScopeTitleMap = {
  [McpScope.FollowUps]: "Follow-ups",
  [McpScope.Resources]: "Resources",
} as const satisfies Record<McpScope, string>;
