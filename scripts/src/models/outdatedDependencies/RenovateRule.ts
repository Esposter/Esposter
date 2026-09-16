// The slice of a `renovate.json` `packageRules` entry the report reads: which packages the rule names, how it
// Holds them, and the dist-tag it follows in place of `latest`. Every other key a rule may carry (grouping,
// Automerge) says how the bot lands an update it is allowed to propose, so the report has no use for it — and a
// Rule that names no packages is not one it reads at all.
export interface RenovateRule {
  allowedVersions?: string;
  description?: string;
  enabled?: boolean;
  followTag?: string;
  matchPackageNames: string[];
}
