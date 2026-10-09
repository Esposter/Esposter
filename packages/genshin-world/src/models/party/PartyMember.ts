// A character's own state in the party, kept for it whichever team holds it: its HP as a share of its Max HP, so the
// HP keeps its share as the Max HP changes and is none for a character who is down, the energy it has toward its
// Burst, the seconds left before every charge of its skill is back, and the seconds left before its burst may be used
// Again
export interface PartyMember {
  burstCooldownSeconds: number;
  energy: number;
  healthShare: number;
  skillCooldownSeconds: number;
}
