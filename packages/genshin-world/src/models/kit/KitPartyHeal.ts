// A heal a hit may give the whole party as it strikes an enemy, while its striker's character holds a shield: each roll
// Passes at its chance, and the heal is a flat amount of HP plus a share of the striker's DEF, to each member's Max HP
export interface KitPartyHeal {
  chance: number;
  defenseShare: number;
  flatHealth: number;
}
