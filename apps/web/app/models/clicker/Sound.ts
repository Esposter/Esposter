export const Sound = { Buy: "Buy" } as const;
export type Sound = (typeof Sound)[keyof typeof Sound];
