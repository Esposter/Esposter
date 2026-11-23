// Where each card of a carousel is in its cycle: the fake ids in stack order, and which card is moving or has just
// Moved
export interface CardStackState {
  activeCardId?: number | undefined;
  cardIds: number[];
  inactiveCardId?: number | undefined;
  maxShownCards: number;
}
