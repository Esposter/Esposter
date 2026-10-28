import type { Card } from "@/models/visual/Card";

import { takeOne } from "@esposter/shared";

interface UseCardCarouselOptions {
  cards: () => Card[];
  duration: number;
}
// The carousel's cycle: each move takes the top-right card through its active turn, and rotates the stack by one
export const useCardCarousel = ({ cards, duration }: UseCardCarouselOptions) => {
  // Fake card ids are just the card indexes, so we can "rotate" by incrementing the whole list by 1.
  // They double as a z-index.
  const cardIds = ref<number[]>(cards().map((_card, index) => index));
  // The active card is the card that's moving from right -> left -> right.
  const activeCardId = ref<number>();
  const inactiveCardId = ref<number>();
  // Main timer driving card movement.
  const moveCardsTimer = ref<number>();
  const moveOneCard = () => {
    inactiveCardId.value = activeCardId.value;
    if (activeCardId.value === undefined) activeCardId.value = cardIds.value[0];
    else activeCardId.value = undefined;
  };
  // Mark the top-right card active, move it to the end of the array, then unmark it after a timeout.
  const moveCards = () => {
    const currentCards = cards();
    if (currentCards.length === 0) return;
    else if (currentCards.length === 1) moveOneCard();
    else {
      inactiveCardId.value = activeCardId.value;
      activeCardId.value = takeOne(cardIds.value);
      // "Rotate" the cards.
      cardIds.value = cardIds.value.map((id) => (id + 1) % currentCards.length);
    }
  };

  onMounted(() => {
    // Comment this line out when debugging animations so the cards stop moving on you.
    if (duration > 0)
      moveCardsTimer.value = window.setInterval(() => {
        moveCards();
      }, duration);
    moveCards();
  });

  onUnmounted(() => {
    clearInterval(moveCardsTimer.value);
  });
  // Refresh the entire display back to the first step whenever cards update.
  watch(cards, (newCards) => {
    cardIds.value = newCards.map((_card, index) => index);
    inactiveCardId.value = undefined;
    activeCardId.value = 0;
  });

  return { activeCardId, cardIds, inactiveCardId };
};
