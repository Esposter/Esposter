// A step the stacking controls take a selection: one step forward or back in the element list, or to its front or its back
export const StackMove = {
  BringForward: "bringForward",
  BringToFront: "bringToFront",
  SendBackward: "sendBackward",
  SendToBack: "sendToBack",
} as const;
export type StackMove = (typeof StackMove)[keyof typeof StackMove];
