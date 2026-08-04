import type { RefutedRow } from "./RefutedRow";
import type { ReviewFinding } from "./ReviewFinding";
import type { ReviewStats } from "./ReviewStats";

/**
 * Whatever the workflow returned. The fields are optional because the script has four exits — the probe, the two
 * guard errors, and the report — and a test asserting on one of them should not have to narrow a union first.
 */
export interface ReviewReport {
  error?: string;
  findings?: ReviewFinding[];
  level?: string;
  mode?: string;
  probe?: boolean;
  refuted?: RefutedRow[];
  stats?: ReviewStats;
  summary?: string;
  target?: string;
}
