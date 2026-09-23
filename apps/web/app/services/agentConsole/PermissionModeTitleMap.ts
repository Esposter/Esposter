import type { MenuItem } from "@/models/agentConsole/MenuItem";

import { PermissionMode } from "agent-console-server/contracts";

export const PermissionModeTitleMap = {
  [PermissionMode.AcceptEdits]: "Accept edits",
  [PermissionMode.Auto]: "Auto",
  [PermissionMode.BypassPermissions]: "Bypass permissions",
  [PermissionMode.Default]: "Ask before edits",
  [PermissionMode.DontAsk]: "Don't ask",
  [PermissionMode.Plan]: "Plan",
} as const satisfies Record<PermissionMode, string>;

export const PermissionModeMenuItems = Object.values(PermissionMode).map((value): MenuItem<PermissionMode> => ({
  title: PermissionModeTitleMap[value],
  value,
}));
