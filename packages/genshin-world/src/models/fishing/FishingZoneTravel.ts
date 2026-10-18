// The zone's travel drawn when a fish is struck: where it starts on the bar, how fast it moves and for how long, and how
// Wide it is, in the bar's units. The width is the fish's, widened by the rod's accuracy
export interface FishingZoneTravel {
  duration: number;
  offset: number;
  speed: number;
  width: number;
}
