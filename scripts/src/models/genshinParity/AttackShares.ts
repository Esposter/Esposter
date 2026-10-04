// The share of an octave band's frames whose level stands `LISTEN_ATTACK_RISE_DECIBELS` or more over the frame before,
// In the game's sound and in our render
export interface AttackShares {
  game: number;
  ours: number;
}
