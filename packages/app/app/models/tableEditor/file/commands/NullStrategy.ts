export enum NullStrategy {
  DropRow = "Drop Row",
  ReplaceWithNA = "Replace with N/A",
}

export const NullStrategies: ReadonlySet<NullStrategy> = new Set(Object.values(NullStrategy));
