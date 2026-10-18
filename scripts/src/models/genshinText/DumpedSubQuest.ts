// One row of the game's sub quest table, of the fields a Reputation request needs: its own id, the world quest it belongs
// To, and the text hash of the step it shows
export interface DumpedSubQuest {
  mainId: number;
  stepDescTextMapHash: number;
  subId: number;
}
