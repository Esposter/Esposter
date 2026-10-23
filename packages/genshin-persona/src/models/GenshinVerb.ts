export const GenshinVerb = {
  Language: "language",
  Lines: "lines",
  Mute: "mute",
  Pin: "pin",
  Reply: "reply",
  Roster: "roster",
  Status: "status",
  Teardown: "teardown",
  Today: "today",
  Uncarded: "uncarded",
  Unmute: "unmute",
  Unpin: "unpin",
  Untranslated: "untranslated",
  Unverbed: "unverbed",
  Use: "use",
  Viewer: "viewer",
  Voice: "voice",
  Volume: "volume",
} as const;

export type GenshinVerb = (typeof GenshinVerb)[keyof typeof GenshinVerb];

export const GenshinVerbs: readonly GenshinVerb[] = Object.values(GenshinVerb);
