export const MaskSetter = { Mask: "mask" } as const;
export type MaskSetter = (typeof MaskSetter)[keyof typeof MaskSetter];
