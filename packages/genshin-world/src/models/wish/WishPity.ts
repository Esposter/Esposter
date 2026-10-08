// The counters a kind of wish carries from one wish and one banner to the next: the wishes made, the wishes since the last
// Five-star and since the last four-star or better, whether the next of each is the featured one, how many character
// Event five-stars running the promotional character came second, and on the weapon wish the weapon the Epitomized Path
// Charts a course for, if any, and the Fate Points toward it
export interface WishPity {
  chartedWeaponId?: number;
  fatePoints: number;
  fiveStarCount: number;
  fourStarCount: number;
  isFiveStarGuaranteed: boolean;
  isFourStarGuaranteed: boolean;
  lossCount: number;
  wishCount: number;
}
