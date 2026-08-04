import type { Claim } from "./Claim";
import type { Seam } from "./Seam";

/** What a stubbed Scope agent answers. Every field is optional: a suite sets only the one its invariant is about. */
export interface ScopeAnswer {
  changedLines?: number;
  claims?: Claim[];
  claudeMdFiles?: string[];
  conventions?: string;
  diffCommand?: string;
  docPaths?: string[];
  files?: string[];
  recordIndex?: string;
  seams?: Seam[];
  summary?: string;
}
