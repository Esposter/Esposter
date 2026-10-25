import type { JscpdReportFragment } from "#src/models/sweeps/duplicateCode/JscpdReportFragment";

// The JSON report jscpd writes, one entry per duplicated pair of fragments
export interface JscpdReport {
  duplicates: { firstFile: JscpdReportFragment; format: string; secondFile: JscpdReportFragment }[];
}
