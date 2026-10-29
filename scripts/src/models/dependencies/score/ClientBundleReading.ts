import type { ClientBundleReport } from "#src/models/dependencies/score/ClientBundleReport";

export interface ClientBundleReading {
  ageMilliseconds: number;
  report: ClientBundleReport;
}
