// A character out on an expedition: the character, the place and the hours it was sent for, and the moment it left. Its
// Return is read from that moment, so it finishes while the page is closed, as the game's timer does
export interface Expedition {
  characterId: number;
  hours: number;
  leftAt: Temporal.Instant;
  placeId: number;
}
