import * as github from "@pulumi/github";

export const repository: github.Repository = new github.Repository(
  "repository",
  {
    allowAutoMerge: true,
    allowForking: true,
    allowRebaseMerge: false,
    allowSquashMerge: false,
    defaultBranch: "main",
    description: "A nice and casual place for posting random things.",
    hasDiscussions: true,
    hasDownloads: true,
    hasIssues: true,
    hasWiki: true,
    homepageUrl: "https://esposter.com",
    name: "Esposter",
    securityAndAnalysis: {
      secretScanning: {
        status: "disabled",
      },
      secretScanningPushProtection: {
        status: "disabled",
      },
    },
    topics: ["drizzle-orm", "nuxt", "pinia", "postgresql", "trpc", "vue", "vuejs", "vuetify", "zod"],
    visibility: "public",
    vulnerabilityAlerts: true,
  },
  {
    protect: true,
  },
);
