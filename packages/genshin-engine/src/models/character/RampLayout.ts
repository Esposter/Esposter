// How a ramp texture lays its shades out: the game's ramp and the world's shared toon are one row read across its columns,
// and a pack's own MMD toon is one column read down its rows
export enum RampLayout {
  Horizontal = 0,
  Vertical = 1,
}
