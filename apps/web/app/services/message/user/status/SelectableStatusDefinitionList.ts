import type { SelectableStatusDefinition } from "@/models/message/user/status/SelectableStatusDefinition";

import { UserStatus } from "@esposter/db-schema";

export const SelectableStatusDefinitionList: SelectableStatusDefinition[] = [
  { label: "Online", status: UserStatus.Online },
  { label: "Idle", status: UserStatus.Idle },
  { label: "Do Not Disturb", status: UserStatus.DoNotDisturb },
  { label: "Invisible", status: UserStatus.Offline, subtitle: "You will appear offline" },
];
