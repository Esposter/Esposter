import type { WordFilterAction } from "@esposter/db-schema";

export interface WordFilterFormData {
  action: WordFilterAction;
  timeoutDurationMs: number;
  words: string[];
}
