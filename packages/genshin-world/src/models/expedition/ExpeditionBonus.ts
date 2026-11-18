// The chance an expedition bonus comes, by the level of the character sent: from the level it names, the chance as a
// Fraction of one, until the next level the table names
export interface ExpeditionBonus {
  avatarLevel: number;
  probability: number;
}
