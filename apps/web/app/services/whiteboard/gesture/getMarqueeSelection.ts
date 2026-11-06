import type { Bounds, PositionedDocument } from "vue-block-editor-headless";

import { checkIsCoveredBy } from "@/services/whiteboard/gesture/checkIsCoveredBy";
import { getElementBounds } from "vue-block-editor-headless";

// The selection a marquee leaves: the ids it began with, then each element it fully covers that those ids do not already hold
export const getMarqueeSelection = (document: PositionedDocument, baseIds: string[], marquee: Bounds): string[] => [
  ...baseIds,
  ...document.elements
    .filter((element) => !baseIds.includes(element.id) && checkIsCoveredBy(getElementBounds(element), marquee))
    .map(({ id }) => id),
];
