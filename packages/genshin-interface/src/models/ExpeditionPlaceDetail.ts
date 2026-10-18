import type { ExpeditionActionKind } from "#src/models/ExpeditionActionKind";
import type { ExpeditionRewardCell } from "#src/models/ExpeditionRewardCell";

// The picked place's panel: its name and description, the rewards it may pay, the durations it offers, and the action its
// Button takes
export interface ExpeditionPlaceDetail {
  actionKind: ExpeditionActionKind;
  actionLabel: string;
  description: string;
  durations: number[];
  id: number;
  name: string;
  rewards: ExpeditionRewardCell[];
}
