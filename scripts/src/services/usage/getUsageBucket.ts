import { UsageBucket } from "#src/models/usage/UsageBucket";
import { SUBAGENT_FOLDER, WORKFLOW_FOLDER } from "#src/services/usage/constants";

// Where a transcript sits, read from its path: a workflow run, a subagent, or else the session itself
export const getUsageBucket = (path: string): UsageBucket => {
  if (path.includes(WORKFLOW_FOLDER)) return UsageBucket.Workflow;
  if (path.includes(SUBAGENT_FOLDER)) return UsageBucket.Subagent;
  return UsageBucket.Main;
};
