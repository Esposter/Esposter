// One level of the game's expedition bonus table: the character level it names, and the chance of a bonus from that
// Level on, as a fraction of one
export interface ExcelExpeditionBonusRow {
  avatarLevel: number;
  id: number;
  probability: number;
}
