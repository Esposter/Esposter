export const BarType = { Experience: "Experience", Health: "Health" } as const;
export type BarType = (typeof BarType)[keyof typeof BarType];
