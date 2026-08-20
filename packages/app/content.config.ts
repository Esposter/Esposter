import { defineCollection, defineContentConfig } from "@nuxt/content";

import { ContentCollection } from "./shared/models/content/ContentCollection";

export default defineContentConfig({
  collections: {
    // `nuxt prepare` loads this file from `postinstall`, before any workspace package is built, so it cannot
    // Import `DOCS_DIRECTORY` — `@esposter/configuration/dist` does not exist yet on a fresh install. The literal
    // Is held to the constant by `content.config.test.ts`, the same way the JSON configs are for the agent tree.
    [ContentCollection.Docs]: defineCollection({ source: "docs/**/*.md", type: "page" }),
  },
});
