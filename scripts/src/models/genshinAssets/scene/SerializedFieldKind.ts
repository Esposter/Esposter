// The shapes a script's raw serialized bytes are read as, with no type data to name its fields
export enum SerializedFieldKind {
  // A length, then that many records of one shape
  Array = "array",
  // Four floats, each within a colour's range
  Color = "colour",
  // Keyframes of time, value and two slopes (with a weighted mode and two weights in Unity's own layout), then the
  // Curve's wrap modes and rotation order
  Curve = "curve",
  // Any other finite float in a plausible range
  Float = "float",
  // Eight colours, their eight times and eight alpha times, a mode and the counts of each in use
  Gradient = "gradient",
  // A whole number a field is more likely to hold than a float: a count, an enum, a flag
  Integer = "integer",
  // A file index and a path ID the component's data holds
  Pointer = "pointer",
}
