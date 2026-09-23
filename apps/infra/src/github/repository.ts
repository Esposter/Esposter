import * as github from "@pulumi/github";

// Single source of truth: GitHub topics mirror the root package.json keywords. Keep both lists curated to valid
// Topic syntax (lowercase, hyphenated, <=20 entries).
// oxlint-disable-next-line no-restricted-imports -- the repo-root manifest, which no `#src/*` map can reach
import packageJson from "../../../../package.json" with { type: "json" };

export const repository: github.Repository = new github.Repository(
  "repository",
  {
    allowAutoMerge: true,
    allowForking: true,
    allowMergeCommit: true,
    allowRebaseMerge: false,
    // Squash is for an external contributor's pull request against ai/queue, which enters the queue as one
    // Commit carrying the pull request's title and body; develop and main pin the merge commit in their ruleset
    allowSquashMerge: true,
    allowUpdateBranch: true,
    // Native auto-delete bypasses rulesets and would nuke develop on a develop -> main merge. Disabled here; the
    // Delete Merged Branch workflow cleans up head branches while excluding long-lived branches (main, develop).
    deleteBranchOnMerge: false,
    description: "A nice and casual place for posting random things.",
    hasDiscussions: true,
    hasIssues: true,
    hasProjects: true,
    hasWiki: true,
    homepageUrl: "https://esposter.com",
    mergeCommitMessage: "PR_BODY",
    mergeCommitTitle: "PR_TITLE",
    name: "Esposter",
    // Secret scanning and push protection are what a public repository is given for free, and both are on. The
    // Three surfaces beside them — non-provider patterns, AI detection, validity checks — are GitHub Secret
    // Protection, which this repository is not licensed for: the API accepts a PATCH enabling any of them,
    // Returns 200 and leaves the status `disabled`, so declaring one here is a diff that never closes.
    securityAndAnalysis: {
      secretScanning: {
        status: "enabled",
      },
      secretScanningPushProtection: {
        status: "enabled",
      },
    },
    squashMergeCommitMessage: "PR_BODY",
    squashMergeCommitTitle: "PR_TITLE",
    topics: packageJson.keywords,
    visibility: "public",
  },
  { protect: true },
);
