export const AlphaSingleSetter = { Alpha: "alpha" } as const;
export type AlphaSingleSetter = (typeof AlphaSingleSetter)[keyof typeof AlphaSingleSetter];
