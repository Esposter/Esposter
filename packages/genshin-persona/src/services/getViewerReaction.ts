import type { ViewerConfiguration } from "#src/models/ViewerConfiguration";
import type { ViewerMoment } from "#src/models/ViewerMoment";

import { ViewerMoment as Moment } from "#src/models/ViewerMoment";

export interface ViewerReaction {
  isExpressionCleared: boolean;
  motion: string | undefined;
}

// What the viewer does at a moment: the motion the reader mapped to it, if any, and the expression cleared when a
// Turn is over
export const getViewerReaction = (moment: ViewerMoment, motions: ViewerConfiguration["motions"]): ViewerReaction => ({
  isExpressionCleared: moment === Moment.TurnEnd,
  motion: motions[moment],
});
