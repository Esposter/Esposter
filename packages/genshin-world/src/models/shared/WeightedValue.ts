// A value and the weight it is drawn by, relative to the weights of the values it is drawn among
export interface WeightedValue<TValue> {
  value: TValue;
  weight: number;
}
