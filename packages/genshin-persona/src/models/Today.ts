import type { MonthDay } from "#src/models/MonthDay";

export interface Today {
  // The local calendar date as "YYYY-MM-DD": the seed of the day's tie-break and the stamp on a pick record
  isoDate: string;
  monthDay: MonthDay;
}
