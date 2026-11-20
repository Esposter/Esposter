export interface PrecheckReport {
  findings: string[];
  // The barrels `--fix` rewrote, each named by its path
  regenerated: string[];
}
