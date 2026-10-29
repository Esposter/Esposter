import type { DryRunOptions } from "#src/models/shared/DryRunOptions";

export interface ReviewRunInput extends DryRunOptions {
  findingsDirectory: string;
  from: string;
  to: string;
}
