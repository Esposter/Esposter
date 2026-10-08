// One duel rule of the card game's rule table, as the dump names its fields. Only the fields a duel's standard rule
// Reads are typed; the rest (the timers and the matchmaking clocks) belong to the online modes this build does not run
export interface ExcelGcgRuleRow {
  drawCardNum: number;
  elementReactionList: number[];
  handCardLimit: number;
  id: number;
}
