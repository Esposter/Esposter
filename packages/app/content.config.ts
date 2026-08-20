import { DOCS_DIRECTORY } from "@esposter/configuration";
import { defineCollection, defineContentConfig } from "@nuxt/content";

import { ContentCollection } from "./shared/models/content/ContentCollection";

export default defineContentConfig({
  collections: {
    [ContentCollection.Docs]: defineCollection({
      source: `${DOCS_DIRECTORY}/**/*.md`,
      type: "page",
    }),
  },
});
