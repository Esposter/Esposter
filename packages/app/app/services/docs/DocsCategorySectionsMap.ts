import { DocsCategory } from "@/models/docs/DocsCategory";

// Groups the top-level docs sections into the category tabs, keyed by section slug
export const DocsCategorySectionsMap: Readonly<Record<DocsCategory, readonly string[]>> = {
  [DocsCategory.Architecture]: ["architecture", "infra"],
  [DocsCategory.Packages]: ["virrun", "vue-phaserjs"],
  [DocsCategory.Products]: [
    "achievements",
    "anime",
    "clicker",
    "dungeons",
    "esbabbler",
    "fluid-simulator",
    "platform",
    "posts",
    "sheet-editor",
    "users",
  ],
  [DocsCategory.Proposals]: ["proposals"],
};
