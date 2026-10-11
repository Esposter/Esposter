// The kinds of claim `fill` makes, in the order they are offered: a proposal unit, or a compute-queue lane
export enum FillKind {
  Cpu = "cpu",
  Page = "page",
  Unit = "unit",
}
