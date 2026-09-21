// A frozen object rather than an `enum`: node runs these scripts by stripping types, and an `enum` is the one
// Declaration it cannot strip
export const GenshinVerb = {
  Language: "language",
  Lines: "lines",
  Mute: "mute",
  Pin: "pin",
  Reply: "reply",
  Roster: "roster",
  Setup: "setup",
  Status: "status",
  Teardown: "teardown",
  Today: "today",
  Uncarded: "uncarded",
  Unmute: "unmute",
  Unpin: "unpin",
  Untranslated: "untranslated",
  Unverbed: "unverbed",
  Use: "use",
  Voice: "voice",
  Volume: "volume",
} as const;

export type GenshinVerb = (typeof GenshinVerb)[keyof typeof GenshinVerb];

export const GenshinVerbs: readonly GenshinVerb[] = Object.values(GenshinVerb);
