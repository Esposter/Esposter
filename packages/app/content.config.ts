import { defineCollection, defineContentConfig } from "@nuxt/content";

import { ContentCollection } from "./shared/models/content/ContentCollection";

export default defineContentConfig({
  collections: {
    // `nuxt prepare` loads this file from `postinstall`, before any workspace package is built, so it cannot
    // Import `DOCS_DIRECTORY` — `@esposter/configuration/dist` does not exist yet on a fresh install. A rename
    // Needs this literal changed with it, and the docs suite inside that directory is what fails if it is not.
    [ContentCollection.Docs]: defineCollection({ source: "docs/**/*.md", type: "page" }),
  },
});
