import type { CardStackGeometry } from "@/models/visual/CardStackGeometry";
import type { CardStyleVariables } from "@/models/visual/CardStyleVariables";

import { getInactiveCardScaleY } from "@/services/visual/getInactiveCardScaleY";
import { takeOne } from "@esposter/shared";

// Generate CSS card styling for smooth, non-jumping animations.
// Each card from right -> left gains margin, multiplied by the breakpoint-dependent scale.
// The cards shrink towards the back of the stack.
export const getNormalCardStyles = (geometry: CardStackGeometry) => {
  const { cardCount, cardScaleYRatioLoss, maxShownCards, scale } = geometry;
  // Count the cards we care about, ignoring the moving card.
  const numberOfCards = Math.min(maxShownCards, cardCount - 1);
  const inactiveScaleY = getInactiveCardScaleY(geometry);
  const items: CardStyleVariables[] = [];
  // Walk from the right-most card leftwards so each card reuses its right neighbour's margin and scale.
  // Those become its own "old" values, since the animation flows right -> left; reversed at the end for LTR order.
  for (let index = 0; index < numberOfCards; index++) {
    // The right-most card has no older neighbour, so its old values are left unset
    const previous = index === 0 ? undefined : takeOne(items, items.length - 1);
    items.push({
      marginRight: `${index * scale}rem`,
      oldMarginRight: previous?.marginRight,
      oldScaleY: previous ? previous.scaleY : inactiveScaleY,
      scaleY: `${1 - Math.max(0, cardScaleYRatioLoss * (numberOfCards - 1 - index))}`,
    });
  }

  const reversedItems = items.toReversed();
  // Pad the rest so we don't operate on undefined.
  for (let index = numberOfCards; index < maxShownCards; index++) reversedItems.push({});
  return reversedItems;
};
