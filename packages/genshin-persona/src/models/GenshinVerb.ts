// A frozen object rather than an `enum`: node runs these scripts by stripping types, and an `enum` is the one
// Declaration it cannot strip
export const GenshinVerb = {
  Lines: "lines",
  Mute: "mute",
  Pin: "pin",
  Roster: "roster",
  Setup: "setup",
  Teardown: "teardown",
  Today: "today",
  Uncarded: "uncarded",
  Unmute: "unmute",
  Unpin: "unpin",
  Untipped: "untipped",
  Volume: "volume",
} as const;

export type GenshinVerb = (typeof GenshinVerb)[keyof typeof GenshinVerb];
