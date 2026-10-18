// A character in a run's cast: whether it is one of the season's special guests, its Max HP and its Burst's energy cost as they
// Were priced when the cast was chosen, its HP share and its energy, which every stage starts full, and the Vigor it has left,
// Two at the start of a run and one less for each stage it performs
export interface ImaginariumMember {
  burstEnergyCost: number;
  energy: number;
  healthShare: number;
  isSpecialGuest: boolean;
  maxHealth: number;
  vigor: number;
}
