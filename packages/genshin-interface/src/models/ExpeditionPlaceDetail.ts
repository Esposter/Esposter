import type { ExpeditionActionKind } from "#src/models/ExpeditionActionKind";
import type { ExpeditionRewardCell } from "#src/models/ExpeditionRewardCell";

// The picked place's panel: its name and description, the rewards it may pay, the durations it offers each with its
// Label, The status of the expedition away from it (empty while none is out, in which case the durations are drawn),
// And the Action its button takes
export interface ExpeditionPlaceDetail {
  actionKind: ExpeditionActionKind;
  actionLabel: string;
  description: string;
  durations: { hours: number; label: string }[];
  id: number;
  name: string;
  rewards: ExpeditionRewardCell[];
  statusLabel: string;
}
