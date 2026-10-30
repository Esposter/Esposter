import type { SetupEnvironment } from "#src/models/setup/SetupEnvironment";
import type { SetupRow } from "#src/models/setup/SetupRow";
import type { SetupTool } from "#src/models/setup/SetupTool";

import { checkIsToolPresent } from "#src/services/setup/checkIsToolPresent";
import { getInstallLine } from "#src/services/setup/getInstallLine";
import { getStepRow } from "#src/services/setup/getStepRow";

// A tool's row: in place, or the line that installs it on this platform
export const readToolRow = (tool: SetupTool, environment: SetupEnvironment): SetupRow =>
  getStepRow(
    tool.name,
    checkIsToolPresent(tool, environment),
    getInstallLine(tool.name, tool.install, environment.platform),
  );
