import type { CardStyleVariables } from "@/models/visual/CardStyleVariables";

// Each card's stacking and its offset's values, as custom properties the one normal-card rule reads, so the stack
// Is as deep as `maxShownCards` says rather than as deep as the stylesheet was written for
export const getCardStyles = (cardIds: number[], normalCardStyles: CardStyleVariables[]) =>
  cardIds.map((_cardId, offset) => {
    const { marginRight, oldMarginRight, oldScaleY, scaleY } = normalCardStyles[offset] ?? {};
    return {
      "--margin-right": marginRight,
      "--old-margin-right": oldMarginRight,
      "--old-scale-y": oldScaleY,
      "--scale-y": scaleY,
      zIndex: cardIds.length - offset,
    };
  });
