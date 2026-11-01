// The queue the Queues tab's detail shows, the first holding an order: its id, the words over its ring (its time left, or
// Complete once every unit is done), its units done in words, its share of the unit being forged, and whether a unit is
// Ready to obtain
export interface ForgeQueueDetail {
  forgedLabel: string;
  headingLabel: string;
  id: number;
  isObtainable: boolean;
  progress: number;
}
