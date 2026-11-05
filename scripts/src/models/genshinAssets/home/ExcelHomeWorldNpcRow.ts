// The fields read off one row of the game's home NPC table: the character it is for, and the three talks it speaks in the
// Realm, each gated by the Friendship Level its condition names. A row for no companion, the dump's Paimon among them,
// Holds no talks and no character
export interface ExcelHomeWorldNpcRow {
  avatarID?: number;
  talkIDs?: number[];
}
