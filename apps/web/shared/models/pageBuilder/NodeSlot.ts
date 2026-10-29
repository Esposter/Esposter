// What one slot accepts, read by the document schema, a drop's target and Move to…
export interface NodeSlot<TType extends string> {
  allow: TType[];
}
