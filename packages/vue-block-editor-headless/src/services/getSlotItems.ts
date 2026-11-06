// The items a slot holds in a record of slots, or none for a slot the record does not declare
export const getSlotItems = <TItem>(
  slots: Readonly<Record<string, readonly TItem[]>>,
  slot: string,
): readonly TItem[] => {
  const items = Object.hasOwn(slots, slot) ? slots[slot] : undefined;
  return items ?? [];
};
