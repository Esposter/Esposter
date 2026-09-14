import type { UserStatus } from "@esposter/db-schema";

// One row of the status picker. `Offline` is offered as "Invisible", which is the only entry whose label does
// Not name its own status — hence the subtitle saying what it does
export interface SelectableStatusDefinition {
  label: string;
  status: UserStatus;
  subtitle?: string;
}
