// An aura on a target: its gauge, in gauge units, and how many units it loses a second. Freeze's rate grows the longer
// It holds, and Burning's is none
export interface Aura {
  decayRate: number;
  gauge: number;
}
