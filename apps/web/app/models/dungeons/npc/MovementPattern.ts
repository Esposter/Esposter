export const MovementPattern = { Clockwise: "Clockwise", Idle: "Idle" } as const;
export type MovementPattern = (typeof MovementPattern)[keyof typeof MovementPattern];
