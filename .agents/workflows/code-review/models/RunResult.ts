import type { AgentCall } from "./AgentCall";
import type { ReviewReport } from "./ReviewReport";

/** Everything one stubbed run of the workflow exposes to a test. */
export interface RunResult {
  calls: AgentCall[];
  logs: string[];
  result: ReviewReport;
}
