import type { WishEventKind } from "#src/models/genshinAssets/wish/WishEventKind";

// One event banner page of the wiki, read into its kind, its window as epoch milliseconds, and the names of its
// Promotional five-stars and featured four-stars as the page writes them. The names are joined to ids by the schedule
export interface WishEventPage {
  endTime: number;
  fiveStarNames: string[];
  fourStarNames: string[];
  kind: WishEventKind;
  startTime: number;
}
