import type { ViewerMoment } from "#src/models/ViewerMoment";

import { ViewerMoments } from "#src/models/ViewerMoment";

// A name a motion is mapped to, as the verb takes it: one of the moments the terminal reaches the model at
export const checkIsViewerMoment = (name: string): name is ViewerMoment => {
  const names: readonly string[] = ViewerMoments;
  return names.includes(name);
};
