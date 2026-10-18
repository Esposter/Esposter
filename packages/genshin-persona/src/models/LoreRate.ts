// One row of the welcome's chart: the character's roster name, the name as the interface language spells it, and the
// Tier's probability for the character. A theme reads these rows from the session-start context to draw the odds
export interface LoreRate {
  displayName: string;
  name: string;
  probability: number;
}
