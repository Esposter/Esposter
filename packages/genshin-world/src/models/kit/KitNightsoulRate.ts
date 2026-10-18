// The Nightsoul points a Nightsoul's Blessing gains, or with a negative rate drains, each second it lasts, and the most it
// Holds. A step runs them on, as gcsim's Nightsoul tick does, and a Natlan character's points are held only while its
// Blessing lasts
export interface KitNightsoulRate {
  maximum: number;
  perSecond: number;
}
