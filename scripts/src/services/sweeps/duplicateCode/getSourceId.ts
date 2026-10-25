import type { JscpdReportFragment } from "#src/models/sweeps/duplicateCode/JscpdReportFragment";

import { FORMAT_SUFFIX_REGEX, WINDOWS_VERBATIM_PREFIX_REGEX } from "#src/services/sweeps/duplicateCode/constants";

export const getSourceId = ({ name }: JscpdReportFragment): string =>
  name.replace(WINDOWS_VERBATIM_PREFIX_REGEX, "").replace(FORMAT_SUFFIX_REGEX, "");
