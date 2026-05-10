export enum Flipped {
  Diagonally = 0x20000000,
  Vertically = 0x40000000,
  Horizontally = 0x80000000,
}

export const Flippeds: ReadonlySet<Flipped> = new Set(
  Object.values(Flipped).filter((value): value is Flipped => typeof value === "number"),
);
