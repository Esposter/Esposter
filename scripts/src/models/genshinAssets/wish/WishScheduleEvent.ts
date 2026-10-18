import type { WishEventKind } from "#src/models/genshinAssets/wish/WishEventKind";

// One event banner of the wish schedule as the build publishes it: its page's title as its id, its kind, its window as
// Epoch milliseconds and the game's ids of its featured five-stars and four-stars
export interface WishScheduleEvent {
  endTime: number;
  fiveStarIds: number[];
  fourStarIds: number[];
  id: string;
  kind: WishEventKind;
  startTime: number;
}
