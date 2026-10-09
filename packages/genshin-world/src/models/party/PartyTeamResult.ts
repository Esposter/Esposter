// What an edit or a deploy in Party Setup did: done, or the game's reason for refusing it, a fallen character where one
// Must stand ("Character is down"), a deployed team left with nobody in it, a team added past fifteen ("Full"), or a
// Default team or the deployed one disbanded, which the game keeps ("Kept")
export enum PartyTeamResult {
  Done = "Done",
  Down = "Down",
  Empty = "Empty",
  Full = "Full",
  Kept = "Kept",
}
