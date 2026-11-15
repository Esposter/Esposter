export const SinName = {
  Envy: "envy",
  Gluttony: "gluttony",
  Greed: "greed",
  Lust: "lust",
  Pride: "pride",
  Sloth: "sloth",
  Wrath: "wrath",
} as const;
export type SinName = (typeof SinName)[keyof typeof SinName];

// The seven sins, in the order the pane draws them. Each is one `score` question Jev answers about a prompt
export const SIN_NAMES: readonly SinName[] = Object.values(SinName);
