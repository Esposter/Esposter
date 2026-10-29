// The props of a type that hold nodes, which are exactly its slots
export type SlotKey<TProps, TNode> = {
  [TKey in keyof TProps]-?: TProps[TKey] extends TNode[] ? TKey : never;
}[keyof TProps];
