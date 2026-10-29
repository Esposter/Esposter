export interface PrecheckReport {
  // The main checkout has no built configuration, so the generator cannot run, and nothing else was checked
  distributionMissing: boolean;
  findings: string[];
  // The barrels `--fix` rewrote, each named by its path
  regenerated: string[];
}
