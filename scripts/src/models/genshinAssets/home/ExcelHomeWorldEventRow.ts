// The fields read off one row of the game's home event table: the companion it is for, the furnishing suite it favours,
// Its event type, and the talk the companion speaks. A reward event also names its one-time reward, and the dump's
// Defaults write a summon event's reward back as zero, which no reader of a summon event reads
export interface ExcelHomeWorldEventRow {
  avatarID: number;
  eventType: string;
  furnitureSuitID: number;
  rewardID: number;
  talkID: number;
}
