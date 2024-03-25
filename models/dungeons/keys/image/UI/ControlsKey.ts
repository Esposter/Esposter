export const ControlsKey = {
  Base: "Base",
  Thumb: "Thumb",
} as const;
export type ControlsKey = keyof typeof ControlsKey;
