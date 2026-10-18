// The limit a placement would pass in its area: the area's count of furnishings, or its load. A placement passing neither is
// Placed, and one passing either is refused with the notice for the limit it passed
export enum HomeFurnishingLimit {
  Count = "Count",
  Load = "Load",
}
