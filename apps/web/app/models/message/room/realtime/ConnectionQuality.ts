export const ConnectionQuality = { Good: "good", Poor: "poor", Unknown: "unknown" } as const;
export type ConnectionQuality = (typeof ConnectionQuality)[keyof typeof ConnectionQuality];
