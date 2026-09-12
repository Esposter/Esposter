import type { DoctorReport } from "#src/models/cli/DoctorReport";

import { Color } from "#src/models/cli/Color";
import { colorize } from "#src/services/cli/color/colorize";
import { formatCheckLine } from "#src/services/cli/doctor/formatCheckLine";
import { formatDoctorSummary } from "#src/services/cli/doctor/formatDoctorSummary";
import { formatVirrunLine } from "#src/services/cli/format/formatVirrunLine";
// Renders the doctor report: a platform-stamped header, one aligned row per check, and the verdict. Pure over
// Already-probed checks so the IO stays in probeOsBackendChecks and the layout is unit-tested.
export const formatDoctorReport = ({ checks, platform }: DoctorReport): string => {
  const labelWidth = Math.max(...checks.map((check) => check.label.length));
  const lines = checks.map((check) => formatCheckLine(check, labelWidth));
  const header = formatVirrunLine(`doctor — os backend prerequisites (${colorize(platform, Color.Blue)})`);
  return [header, ...lines, formatDoctorSummary(checks)].join("\n");
};
