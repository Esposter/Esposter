// How a kit module's site holds its value
export enum KitModuleSiteKind {
  // A whole hit, action, area or stance's actions, or a list of them, that a behaviour reads from outside itself
  Capture = "Capture",
  // One field of a hit or action literal a behaviour builds as it plays, whose other fields it reads as it plays
  Field = "Field",
  // The numerator of a frame count divided by the frames in a second
  Frames = "Frames",
  // A talent's parameter, its group and index read from the module's own text
  Talent = "Talent",
  // A number a behaviour reads from outside itself
  Value = "Value",
}
