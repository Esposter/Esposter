// A plugin-boundary contract: the genshin-persona plugin writes this row and installs apart from the app, so the two
// Copies name each other and must change together (the plugin reads only its own lockfile): packages/genshin-persona/src/models/LoreRate.ts
// One row of the welcome's chart as the session-start hook carries it: the character's roster name, the name as the
// Interface language spells it, and the tier's probability for the character
export interface LoreRate {
  displayName: string;
  name: string;
  probability: number;
}
