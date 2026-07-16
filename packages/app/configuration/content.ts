import type { NuxtConfig } from "nuxt/schema";

export const content: NuxtConfig["content"] = {
  build: {
    markdown: {
      highlight: {
        // Single dark theme so code blocks read well in both app themes without per-theme CSS variables
        theme: "github-dark",
      },
    },
  },
  experimental: {
    // Use node:sqlite so we don't need the better-sqlite3 native dependency
    sqliteConnector: "native",
  },
};
