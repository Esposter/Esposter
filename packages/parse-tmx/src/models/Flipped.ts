export enum Flipped {
  Diagonally = 0x20000000,
  Vertically = 0x40000000,
  Horizontally = 0x80000000,
}

export const Flippeds: ReadonlySet<string | Flipped> = new Set(Object.values(Flipped));
