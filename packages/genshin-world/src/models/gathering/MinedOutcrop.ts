// A mining outcrop the player has mined: its place's id, and the instant it was mined, which keeps it gone until the next reset
export interface MinedOutcrop {
  id: string;
  minedAt: Temporal.Instant;
}
