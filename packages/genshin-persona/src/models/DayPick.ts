import type { Nameplate } from "#src/models/Nameplate";

// The character every session started on one day meets, settled by the first of them
export interface DayPick extends Nameplate {
  isoDate: string;
}
