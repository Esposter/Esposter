import type { ViewerConfiguration } from "#src/models/ViewerConfiguration";
import type { ViewerMoment } from "#src/models/ViewerMoment";

import { ViewerMoments } from "#src/models/ViewerMoment";
import { checkIsViewerAddress } from "#src/services/checkIsViewerAddress";
import { VIEWER_PATH } from "#src/services/constants";
import { parseJsonObject } from "#src/services/parseJsonObject";
import { readStateFile } from "#src/services/readStateFile";

// The viewer the file names, or nothing when there is none: the gate every reading and every reaction passes, so a
// Machine with no viewer runs the stock path unchanged. A field the file holds wrongly is no viewer rather than a
// Guess at one
export const readViewerConfiguration = (): ViewerConfiguration | undefined => {
  const content = readStateFile(VIEWER_PATH);
  if (!content) return undefined;

  const { address, modelId, motions } = parseJsonObject(content);
  if (typeof address !== "string" || !checkIsViewerAddress(address)) return undefined;
  if (typeof modelId !== "number" || !Number.isInteger(modelId) || modelId < 0) return undefined;
  return { address, modelId, motions: readMotions(motions) };
};

const readMotions = (motions: unknown): ViewerConfiguration["motions"] => {
  if (typeof motions !== "object" || motions === null) return {};

  const result: Partial<Record<ViewerMoment, string>> = {};
  for (const moment of ViewerMoments) {
    const motion: unknown = Reflect.get(motions, moment);
    if (typeof motion === "string" && motion) result[moment] = motion;
  }

  return result;
};
