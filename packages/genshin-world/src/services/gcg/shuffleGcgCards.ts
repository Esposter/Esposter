// The cards in a random order from the seeded source: each card takes a random key, and the cards sort by their keys
export const shuffleGcgCards = (cardIds: number[], random: () => number): number[] =>
  cardIds
    .map((cardId) => ({ cardId, key: random() }))
    .toSorted((firstCard, secondCard) => firstCard.key - secondCard.key)
    .map(({ cardId }) => cardId);
