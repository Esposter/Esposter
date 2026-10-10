// A status a character carries for the seconds left of it, as gcsim's character statuses are: a passive's or a
// Constellation's own cooldown, or a mark a kit reads later. A second one of its id on the same character restarts it
export interface KitStatus {
  characterId: number;
  id: string;
  kind: "status";
  secondsRemaining: number;
}
