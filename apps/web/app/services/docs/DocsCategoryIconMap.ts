import { DocsCategory } from "@/models/docs/DocsCategory";

export const DocsCategoryIconMap: Readonly<Record<DocsCategory, string>> = {
  [DocsCategory.Architecture]: "mdi-sitemap",
  [DocsCategory.Packages]: "mdi-package-variant",
  [DocsCategory.Products]: "mdi-apps",
  [DocsCategory.Proposals]: "mdi-lightbulb",
};
