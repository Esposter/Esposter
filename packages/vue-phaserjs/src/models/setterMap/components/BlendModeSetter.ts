export const BlendModeSetter = { BlendMode: "blendMode" } as const;
export type BlendModeSetter = (typeof BlendModeSetter)[keyof typeof BlendModeSetter];
