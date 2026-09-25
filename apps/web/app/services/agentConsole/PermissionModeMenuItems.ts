import type { UiSelectItem } from "@/models/ui/UiSelectItem";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { PermissionMode } from "agent-console-server/contracts";

const PermissionModeTitleMap = {
  [PermissionMode.AcceptEdits]: "Accept edits",
  [PermissionMode.Auto]: "Auto",
  [PermissionMode.BypassPermissions]: "Bypass permissions",
  [PermissionMode.Default]: "Ask before edits",
  [PermissionMode.DontAsk]: "Don't ask",
  [PermissionMode.Plan]: "Plan",
} as const satisfies Record<PermissionMode, string>;
const PermissionModeIconMeaningMap = {
  [PermissionMode.AcceptEdits]: UiIconMeaning.Edit,
  [PermissionMode.Auto]: UiIconMeaning.Automatic,
  [PermissionMode.BypassPermissions]: UiIconMeaning.Warning,
  [PermissionMode.Default]: UiIconMeaning.Lock,
  [PermissionMode.DontAsk]: UiIconMeaning.DoNotDisturb,
  [PermissionMode.Plan]: UiIconMeaning.Plan,
} as const satisfies Record<PermissionMode, UiIconMeaning>;
export const PermissionModeMenuItems = Object.values(PermissionMode).map((value): UiSelectItem<PermissionMode> => ({
  meaning: PermissionModeIconMeaningMap[value],
  title: PermissionModeTitleMap[value],
  value,
}));
