import type { NuxtConfig } from "nuxt/schema";

export const content: NuxtConfig["content"] = {
  build: {
    markdown: {
      highlight: {
        // Replaces (not extends) the default grammar list, so every language the docs use must be listed
        // Here or it silently renders as plain text — mermaid included, whose fences render as diagrams
        // `text`/`plaintext` needs no entry — shiki treats it as the built-in no-highlight alias, and the
        // BundledLanguage type rejects it
        langs: ["bash", "css", "html", "js", "json", "md", "mdc", "mermaid", "sql", "ts", "vue", "yaml"],
        // One theme written in the UI library's tokens, so highlighted code follows the style and the mode as the prose
        // Around it does: keywords and tags in the accent, strings and insertions in success, names in info, numbers
        // And constants in warning, deletions in error, comments muted, and everything else the text. Shiki writes each
        // Colour inline as given, so a `var()` resolves wherever the block is drawn
        theme: {
          default: {
            colors: { "editor.background": "transparent", "editor.foreground": "var(--ui-text)" },
            name: "ui-tokens",
            settings: [
              { scope: ["comment", "punctuation.definition.comment"], settings: { foreground: "var(--ui-muted)" } },
              {
                scope: ["keyword", "storage", "storage.type", "storage.modifier", "entity.name.tag", "markup.heading"],
                settings: { foreground: "var(--ui-accent)" },
              },
              {
                scope: ["string", "punctuation.definition.string", "string.regexp", "markup.inserted"],
                settings: { foreground: "var(--ui-success)" },
              },
              {
                scope: [
                  "entity.name.function",
                  "support.function",
                  "entity.name.type",
                  "entity.name.class",
                  "support.type",
                  "support.class",
                  "entity.other.attribute-name",
                  "markup.link",
                ],
                settings: { foreground: "var(--ui-info)" },
              },
              {
                scope: ["constant", "support.constant", "variable.other.constant", "variable.language"],
                settings: { foreground: "var(--ui-warning)" },
              },
              { scope: ["markup.deleted", "invalid"], settings: { foreground: "var(--ui-error)" } },
              { scope: ["markup.bold"], settings: { fontStyle: "bold" } },
              { scope: ["markup.italic"], settings: { fontStyle: "italic" } },
            ],
          },
        },
      },
    },
  },
  experimental: {
    // Use node:sqlite so we don't need the better-sqlite3 native dependency
    sqliteConnector: "native",
  },
};
