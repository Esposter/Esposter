// The phase a gesture is in, each the discriminant of its state. A canvas with no gesture in progress holds no phase at all
export enum GesturePhase {
  Arrow = "arrow",
  Drawing = "drawing",
  Marquee = "marquee",
  Moving = "moving",
  Panning = "panning",
  Pressed = "pressed",
  Resizing = "resizing",
}
