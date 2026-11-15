// What a fleet entry is: an item of the compute queue, or an open proposal unit
export const FleetEntryKind = { Queue: "queue", Unit: "unit" } as const;
export type FleetEntryKind = (typeof FleetEntryKind)[keyof typeof FleetEntryKind];
