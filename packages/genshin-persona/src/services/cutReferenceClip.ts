import type { PcmClip } from "#src/models/PcmClip";

import { TravelerTwinMap } from "#src/services/constants";
import { cutOpeningTurn } from "#src/services/cutOpeningTurn";

// What of a line's clip is the character's own voice: all of it, except for a player twin, whose every line is a
// Dialogue with Paimon and whose reference is the turn they open it with
export const cutReferenceClip = (name: string, clip: PcmClip): PcmClip =>
  TravelerTwinMap[name] ? cutOpeningTurn(clip) : clip;
