import type { NuxtConfig } from "nuxt/schema";

export const content: NuxtConfig["content"] = {
  build: {
    markdown: {
      highlight: {
        // Replaces (not extends) the default grammar list, so every language the docs use must be listed
        // Here or it silently renders as plain text — mermaid included, whose fences render as diagrams
        langs: ["bash", "css", "html", "js", "json", "md", "mdc", "mermaid", "sql", "ts", "vue", "yaml"],
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
