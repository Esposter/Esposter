// The fields read off one row of the game's home NPC table: the character it is for, and the three talks it speaks in
// The realm, the second and third each gated by the Friendship Level its condition names and the first by none. A row
// For no companion, the dump's Paimon among them, holds no talks and no character
export interface ExcelHomeWorldNpcRow {
  avatarID?: number;
  talkIDs?: number[];
}
