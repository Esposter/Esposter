import type { OutcropKind } from "#src/models/leyLine/OutcropKind";
import type { OutcropStage } from "#src/models/leyLine/OutcropStage";

// One ley line outcrop standing in its region: its kind, the place it stands at and the stage it is in
export interface Outcrop {
  kind: OutcropKind;
  placeId: number;
  stage: OutcropStage;
}
