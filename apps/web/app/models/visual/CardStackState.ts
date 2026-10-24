// Where each card of a carousel is in its cycle: the fake ids in stack order, and which card is moving or has just moved
export interface CardStackState {
  activeCardId?: number;
  cardIds: number[];
  inactiveCardId?: number;
  maxShownCards: number;
}
