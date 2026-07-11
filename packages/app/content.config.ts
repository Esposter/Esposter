import { defineCollection, defineContentConfig } from "@nuxt/content";

import { ContentCollection } from "./shared/models/content/ContentCollection";

export default defineContentConfig({
  collections: {
    [ContentCollection.Docs]: defineCollection({
      source: "docs/**",
      type: "page",
    }),
  },
});
