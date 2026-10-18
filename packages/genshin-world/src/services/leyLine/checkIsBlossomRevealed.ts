import type { Outcrop } from "#src/models/leyLine/Outcrop";

import { OutcropStage } from "#src/models/leyLine/OutcropStage";

// Whether an outcrop's blossom shows: it does once its enemies are all defeated, while it is cleared and not yet claimed
export const checkIsBlossomRevealed = ({ stage }: Outcrop): boolean => stage === OutcropStage.Cleared;
