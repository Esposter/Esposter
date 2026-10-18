import type { ViewerConfiguration } from "#src/models/ViewerConfiguration";

import { ViewerMoments } from "#src/models/ViewerMoment";

export const readMotions = (motions: unknown): ViewerConfiguration["motions"] => {
  if (typeof motions !== "object" || motions === null) return {};

  const result: ViewerConfiguration["motions"] = {};
  for (const moment of ViewerMoments) {
    const motion: unknown = Reflect.get(motions, moment);
    if (typeof motion === "string" && motion) result[moment] = motion;
  }

  return result;
};
