// A status an enemy carries for the seconds left of it, which a kit's hit or an effect applies: its id, the seconds it has
// Left, and the bonus its DMG taken gains, added to the damage bonus of each hit that strikes it while it lasts
export interface EnemyStatus {
  damageTakenBonus: number;
  id: string;
  secondsRemaining: number;
}
