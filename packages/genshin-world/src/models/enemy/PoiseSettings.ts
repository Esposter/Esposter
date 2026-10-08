// A poise type's bar: its length, how fast it refills while not broken, how much of a hit's poise damage it takes, and
// How long it stays broken before it resets to full; a bar that never stays broken refills from empty instead
export interface PoiseSettings {
  endurance: number;
  length: number;
  refillPerSecond: number;
  resetSeconds: number;
}
