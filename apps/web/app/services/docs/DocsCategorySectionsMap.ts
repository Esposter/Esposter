import { DocsCategory } from "@/models/docs/DocsCategory";

// Groups the top-level docs sections into the category tabs, keyed by section slug
export const DocsCategorySectionsMap: Readonly<Record<DocsCategory, readonly string[]>> = {
  [DocsCategory.Architecture]: ["architecture", "infra"],
  [DocsCategory.Packages]: ["pitch-transcription", "trpc-msw", "trpc-nuxt-module", "virrun", "vue-phaserjs"],
  [DocsCategory.Products]: [
    "achievement",
    "anime",
    "clicker",
    "dungeons",
    "esbabbler",
    "fluid-simulator",
    "genshin",
    "post",
    "resource",
    "user",
  ],
  [DocsCategory.Proposals]: ["proposals"],
};
