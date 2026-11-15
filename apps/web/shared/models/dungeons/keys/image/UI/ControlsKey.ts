export const ControlsKey = { Base: "Base", Thumb: "Thumb" } as const;
export type ControlsKey = (typeof ControlsKey)[keyof typeof ControlsKey];
