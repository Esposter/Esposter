export enum NullStrategy {
  DropRow = "Drop Row",
  ReplaceWithNA = "Replace with N/A",
}

export const NullStrategies = Object.values(NullStrategy);
