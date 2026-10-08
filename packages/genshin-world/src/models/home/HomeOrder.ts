// The one furnishing a queue of Tubby's is making: the blueprint it makes and the moment it began. A furnishing takes its
// Seconds from that moment, so it is done while the page is closed. A furnishing done but not yet collected still counts
export interface HomeOrder {
  blueprintId: number;
  startedAt: Temporal.Instant;
}
