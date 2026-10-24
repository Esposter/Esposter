// The sizes a carousel's stack takes at the screen's breakpoint, which its cards' styles are computed from
export interface CardStackGeometry {
  cardCount: number;
  // Ratio of how much shorter the next card is
  cardScaleYRatioLoss: number;
  maxShownCards: number;
  // Each card from right -> left gains margin, multiplied by this breakpoint-dependent scale
  scale: number;
}
