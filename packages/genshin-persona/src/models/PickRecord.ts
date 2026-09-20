import type { Nameplate } from "#src/models/Nameplate";

export interface PickRecord extends Nameplate {
  isoDate: string;
  sessionId: string;
}
