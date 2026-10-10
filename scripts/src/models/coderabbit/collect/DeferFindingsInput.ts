import type { DrainInput } from "#src/models/coderabbit/collect/DrainInput";

export interface DeferFindingsInput extends Omit<DrainInput, "feedback"> {
  // The failed drains the cap counted, and the newest one's own sentence for why it failed
  attempts: number;
  cause: string;
  isDryRun: boolean;
  viewerLogin: string;
}
