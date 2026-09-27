// An area where a proposal left the tree after its last product-review pass, so the next pass is owed
export interface OwedReview {
  area: string;
  // The commit date of the last product-review pass naming the area, or "" when none ever has
  lastPassDate: string;
  lastShipDate: string;
}
