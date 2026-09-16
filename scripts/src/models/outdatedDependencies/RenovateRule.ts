// The slice of a `renovate.json` `packageRules` entry the report reads: which packages the rule names and how it
// Holds them. Every other key a rule may carry (grouping, automerge) says how the bot lands an update it is allowed
// To propose, so the report has no use for it — and a rule that names no packages is not one it reads at all.
export interface RenovateRule {
  allowedVersions?: string;
  description?: string;
  enabled?: boolean;
  matchPackageNames: string[];
}
