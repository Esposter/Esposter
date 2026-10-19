// The types a slot accepts, narrowed from the registry's list, or none for a slot the slots record does not declare
export const getSlotTypes = (slots: object, slot: string): string[] => {
  const slotTypes: unknown = Object.entries(slots).find(([key]) => key === slot)?.[1];
  return Array.isArray(slotTypes) && slotTypes.every((type): type is string => typeof type === "string")
    ? slotTypes
    : [];
};
