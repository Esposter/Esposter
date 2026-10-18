import type { ChestPlace } from "#src/models/chest/ChestPlace";
import type { TimeTrialMarker } from "#src/models/puzzle/TimeTrialMarker";

import { TimeTrialChallengeState } from "#src/models/puzzle/TimeTrialChallengeState";
import { TIME_TRIAL_CHEST_KIND } from "#src/services/puzzle/constants";

// The chest each Time Trial Challenge spawns at its marker once it is solved, every target done before its timer ended
export const computeTimeTrialChestPlaces = (markers: readonly TimeTrialMarker[]): ChestPlace[] =>
  markers
    .filter(({ challenge }) => challenge.state === TimeTrialChallengeState.Solved)
    .map(({ id, position }) => ({ id: `time-trial-chest-${id}`, kind: TIME_TRIAL_CHEST_KIND, position }));
