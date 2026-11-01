import type { PanzoomContext } from "#src/models/panzoom/PanzoomContext";
import type { PanzoomZoomOptions } from "#src/models/panzoom/PanzoomZoomOptions";

// The options a call takes: the instance's, with the call's own laid over them
export const getPanzoomCallOptions = (
  { options }: PanzoomContext,
  callOptions: PanzoomZoomOptions,
): PanzoomZoomOptions => ({ ...options, ...callOptions });
