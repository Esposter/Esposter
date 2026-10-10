import { UsageBucket } from "#src/models/usage/UsageBucket";
import { SUBAGENT_FOLDER, WORKFLOW_FOLDER } from "#src/services/usage/constants";

// Where a transcript sits, read from its path's folders under either separator, since Windows joins with backslashes:
// A workflow run, a subagent, or else the session itself
export const getUsageBucket = (path: string): UsageBucket => {
  const folders = path.split(/[/\\]/u);
  if (folders.includes(WORKFLOW_FOLDER)) return UsageBucket.Workflow;
  if (folders.includes(SUBAGENT_FOLDER)) return UsageBucket.Subagent;
  return UsageBucket.Main;
};
