// A shield on a character that absorbs the damage it takes for the seconds left of it, until its health is spent
export interface KitShield {
  characterId: number;
  health: number;
  kind: "shield";
  secondsRemaining: number;
}
