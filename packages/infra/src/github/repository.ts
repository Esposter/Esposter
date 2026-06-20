import * as github from "@pulumi/github";

// Single source of truth: GitHub topics mirror the root package.json keywords.
// Keep both lists curated to valid topic syntax (lowercase, hyphenated, <=20 entries).
import packageJson from "../../../../package.json" with { type: "json" };

export const repository: github.Repository = new github.Repository(
  "repository",
  {
    allowAutoMerge: true,
    allowForking: true,
    allowMergeCommit: true,
    allowRebaseMerge: false,
    allowSquashMerge: false,
    allowUpdateBranch: true,
    // Native auto-delete bypasses rulesets and would nuke develop on a develop -> main
    // merge. Disabled here; the Delete Merged Branch workflow cleans up head branches
    // while excluding long-lived branches (main, develop).
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
    securityAndAnalysis: {
      secretScanning: {
        status: "enabled",
      },
      secretScanningPushProtection: {
        status: "enabled",
      },
    },
    topics: packageJson.keywords,
    visibility: "public",
  },
  {
    protect: true,
  },
);
