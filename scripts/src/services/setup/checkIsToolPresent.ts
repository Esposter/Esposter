import type { SetupEnvironment } from "#src/models/setup/SetupEnvironment";
import type { SetupTool } from "#src/models/setup/SetupTool";

// Whether a tool is installed: its command answers with output its pattern matches, when one is set, or the file it
// leaves on this platform exists
export const checkIsToolPresent = (tool: SetupTool, environment: SetupEnvironment): boolean => {
  if (!("probe" in tool)) {
    const path = tool.paths[environment.platform];
    return path !== undefined && environment.exists(path);
  }
  const { status, stdout } = environment.run(tool.probe.file, tool.probe.args);
  return status === 0 && (tool.probe.output === undefined || (stdout !== null && tool.probe.output.test(stdout)));
};
