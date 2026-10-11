// A value under `below` earns `points`; the first band it falls under is the one that counts
export interface ScoreBand {
  below: number;
  points: number;
}
