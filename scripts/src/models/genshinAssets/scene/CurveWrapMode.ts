// How a curve reads at a time before its first key or after its last, as Unity serializes it (its own internal modes,
// Not the public WrapMode a script sets them by)
export enum CurveWrapMode {
  // Back and forth across the keys
  PingPong = 0,
  // The keys over again from the first
  Repeat = 1,
  // The nearest end key's value
  Clamp = 2,
}
