import type { ClientBundleReading } from "#src/models/dependencies/score/ClientBundleReading";

import { clientBundleReportSchema } from "#src/models/dependencies/score/ClientBundleReport";
import { CLIENT_BUNDLE_REPORT_PATH } from "#src/services/dependencies/score/constants";
import { APP_DIRECTORY, REPOSITORY_ROOT } from "#src/services/shared/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { existsSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";

// The app's client bundle report last written by `nuxt analyze`, with how long ago it was written
export const readClientBundleReport = (): ClientBundleReading => {
  const path = resolve(REPOSITORY_ROOT, APP_DIRECTORY, CLIENT_BUNDLE_REPORT_PATH);
  if (!existsSync(path))
    throw new InvalidOperationError(Operation.Read, path, "no client bundle report, so run it with --analyze");

  return {
    ageMilliseconds: Temporal.Now.instant().epochMilliseconds - statSync(path).mtimeMs,
    report: clientBundleReportSchema.parse(parseMachineJson(readFileSync(path, "utf8"))),
  };
};
