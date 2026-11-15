// Steady mode reviews what `ai/queue` holds past `main`; range mode reviews an explicit `from..to` and never moves `main`
export const ReviewMode = { Range: "range", Steady: "steady" } as const;
export type ReviewMode = (typeof ReviewMode)[keyof typeof ReviewMode];
