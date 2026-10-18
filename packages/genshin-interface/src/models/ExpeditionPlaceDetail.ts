import type { ExpeditionActionKind } from "#src/models/ExpeditionActionKind";
import type { ExpeditionRewardCell } from "#src/models/ExpeditionRewardCell";

// The picked place's panel: its name and description, the rewards it may pay, the durations it offers, the status of
// The expedition away from it (empty while none is out, in which case the durations are drawn), and the action its
// Button takes
export interface ExpeditionPlaceDetail {
  actionKind: ExpeditionActionKind;
  actionLabel: string;
  description: string;
  durations: number[];
  id: number;
  name: string;
  rewards: ExpeditionRewardCell[];
  statusLabel: string;
}
