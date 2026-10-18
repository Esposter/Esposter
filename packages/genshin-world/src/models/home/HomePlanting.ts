// One seed planted in a realm's garden: the plot it is planted on, the seed's item id, and the instant it was planted at.
// It ripens from that instant over the seconds its plant takes, so it is grown while the page is closed
export interface HomePlanting {
  plantedAt: Temporal.Instant;
  plotId: number;
  seedItemId: number;
}
