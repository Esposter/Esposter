import type { DuplicateCodeFragment } from "#src/models/sweeps/duplicateCode/DuplicateCodeFragment";
import type { JscpdReportFragment } from "#src/models/sweeps/duplicateCode/JscpdReportFragment";

import { getSourceId } from "#src/services/sweeps/duplicateCode/getSourceId";

export const toDuplicateCodeFragment = (fragment: JscpdReportFragment): DuplicateCodeFragment => ({
  end: fragment.endLoc,
  sourceId: getSourceId(fragment),
  start: fragment.startLoc,
});
