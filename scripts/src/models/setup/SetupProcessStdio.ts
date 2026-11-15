// Where a spawned process's output goes: read by the caller, or shown on this terminal
export const SetupProcessStdio = { Inherit: "inherit", Pipe: "pipe" } as const;
export type SetupProcessStdio = (typeof SetupProcessStdio)[keyof typeof SetupProcessStdio];
