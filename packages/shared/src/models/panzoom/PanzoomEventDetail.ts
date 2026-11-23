// The values after a change, which every event carries as its detail and every method that changes the transform
// Returns
export interface PanzoomEventDetail {
  isSVG: boolean;
  originalEvent?: Event | undefined;
  scale: number;
  x: number;
  y: number;
}
