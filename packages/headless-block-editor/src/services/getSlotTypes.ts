// The types a slot accepts, read from the definition's slots record, or none for a slot the record does not declare
export const getSlotTypes = (slots: Record<string, string[]>, slot: string): string[] => {
  const slotTypes = Object.hasOwn(slots, slot) ? slots[slot] : undefined;
  return slotTypes ?? [];
};
