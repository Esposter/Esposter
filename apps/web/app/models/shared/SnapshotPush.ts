// A change a subscription delivered while a snapshot read was in flight, kept in the order it landed
export type SnapshotPush<TItem extends { id: string }> =
  | { checkIsRemoved: (item: TItem) => boolean; type: "remove" }
  | { id: TItem["id"]; patch: Partial<TItem>; type: "patch" }
  | { item: TItem; type: "set" };
