// An aura on a target: its gauge, in gauge units, how many units it loses a second, and whether it is immutable. Freeze's
// Rate grows the longer it holds, and Burning's is none. An immutable aura, an enemy's innate element, is never consumed
// And never decays, though its gauge still takes its share of a trigger
export interface Aura {
  decayRate: number;
  gauge: number;
  isImmutable: boolean;
}
