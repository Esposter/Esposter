// The table keeps a trigger's ids in its slots, each slot a list joined by commas or semicolons and empty when unused. Each
// Slot is split into its ids and kept in its place, since a trigger counts only the slot its kind watches
export const toTriggerParameters = (paramList: string[]): string[][] =>
  paramList.map((slot) => slot.split(/[,;]/u).filter((id) => id !== ""));
