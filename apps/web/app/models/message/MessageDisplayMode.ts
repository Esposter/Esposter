export const MessageDisplayMode = { Compact: "Compact", Cozy: "Cozy" } as const;
export type MessageDisplayMode = (typeof MessageDisplayMode)[keyof typeof MessageDisplayMode];
