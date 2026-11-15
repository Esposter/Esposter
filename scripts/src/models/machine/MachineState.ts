// The machine's state for the window: idle has room for more runs, tight has none, and busy is anything between
export const MachineState = { Busy: "Busy", Idle: "Idle", Tight: "Tight" } as const;
export type MachineState = (typeof MachineState)[keyof typeof MachineState];
