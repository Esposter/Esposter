export enum BooleanValue {
  False = "false",
  True = "true",
}

export const BooleanValues: ReadonlySet<BooleanValue> = new Set(Object.values(BooleanValue));
