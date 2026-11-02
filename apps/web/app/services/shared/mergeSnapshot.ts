import type { SnapshotPush } from "@/models/shared/SnapshotPush";

// The answer to a read with the pushes that landed while it was in flight replayed over it, in the order they landed.
// The answer can predate a push in either direction, a create it lacks or a removal it still lists, so the last push
// For an item decides that item, and a push the answer already reflects replays to the same state
export const mergeSnapshot = <TItem extends { id: string }>(
  snapshot: TItem[],
  pushes: SnapshotPush<TItem>[],
): TItem[] => {
  const merged = new Map(snapshot.map((item) => [item.id, item]));
  for (const push of pushes)
    if (push.type === "set") merged.set(push.item.id, push.item);
    else if (push.type === "patch") {
      const item = merged.get(push.id);
      if (item) merged.set(push.id, { ...item, ...push.patch });
    } else for (const [id, item] of merged) if (push.checkIsRemoved(item)) merged.delete(id);
  return [...merged.values()];
};
