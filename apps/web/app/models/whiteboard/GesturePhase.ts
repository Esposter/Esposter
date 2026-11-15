// The phase a gesture is in, each the discriminant of its state. A canvas with no gesture in progress holds no phase at all
export const GesturePhase = {
  Arrow: "arrow",
  Connecting: "connecting",
  Drawing: "drawing",
  End: "end",
  Marquee: "marquee",
  Moving: "moving",
  Panning: "panning",
  Placing: "placing",
  Pressed: "pressed",
  Resizing: "resizing",
} as const;
export type GesturePhase = (typeof GesturePhase)[keyof typeof GesturePhase];
