// Where a Benediction lasts: the floor it is chosen on, or the chamber alone
export const AbyssBenedictionScope = { Chamber: "chamber", Floor: "floor" } as const;
export type AbyssBenedictionScope = (typeof AbyssBenedictionScope)[keyof typeof AbyssBenedictionScope];
