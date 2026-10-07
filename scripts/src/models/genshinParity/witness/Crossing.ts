// A landmark's edge crossing a recording's column: whether it turns it darker, the moment in seconds, and how far that
// Moment may be off in seconds
export interface Crossing {
  isFalling: boolean;
  time: number;
  uncertainty: number;
}
