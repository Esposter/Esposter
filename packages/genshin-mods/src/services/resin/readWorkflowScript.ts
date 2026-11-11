import type { EngineInterface } from "claude-code";

import type { WorkflowLaunch } from "../../models/WorkflowLaunch";

// The script a workflow launch runs: the inline one, else the file at its path when that file is there. A saved workflow
// Named with no script, or a path with no file, has none the gate can read
// oxlint-disable-next-line func-style -- A declaration, not an arrow: the hooks module's bundle follows an imported helper that takes `$` only into a function declaration
export async function readWorkflowScript($: EngineInterface, launch: WorkflowLaunch): Promise<string | undefined> {
  if (launch.script !== undefined) return launch.script;
  if (launch.scriptPath === undefined || !(await $.fs.exists(launch.scriptPath))) return undefined;
  return $.fs.read(launch.scriptPath);
}
