import type { ViewerConfiguration } from "#src/models/ViewerConfiguration";

import { ViewerMoments } from "#src/models/ViewerMoment";
import { EMPTY_VIEWER_MOTIONS } from "#src/services/constants";

export const readMotions = (motions: unknown): ViewerConfiguration["motions"] => {
  const result = { ...EMPTY_VIEWER_MOTIONS };
  if (typeof motions !== "object" || motions === null) return result;

  for (const moment of ViewerMoments) {
    const motion: unknown = Reflect.get(motions, moment);
    if (typeof motion === "string") result[moment] = motion;
  }

  return result;
};
