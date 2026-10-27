export enum SinName {
  Pride = "pride",
  Greed = "greed",
  Wrath = "wrath",
  Envy = "envy",
  Lust = "lust",
  Gluttony = "gluttony",
  Sloth = "sloth",
}

// The seven sins, in the order the pane draws them. Each is one `score` question Jev answers about a prompt
export const SIN_NAMES: readonly SinName[] = Object.values(SinName);
