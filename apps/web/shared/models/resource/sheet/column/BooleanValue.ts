export const BooleanValue = { False: "false", True: "true" } as const;
export type BooleanValue = (typeof BooleanValue)[keyof typeof BooleanValue];
