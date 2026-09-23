// @unocss-include
import { DocsCategory } from "@/models/docs/DocsCategory";

export const DocsCategoryIconMap: Readonly<Record<DocsCategory, string>> = {
  [DocsCategory.Architecture]: "i-mdi:sitemap",
  [DocsCategory.Packages]: "i-mdi:package-variant",
  [DocsCategory.Products]: "i-mdi:apps",
  [DocsCategory.Proposals]: "i-mdi:lightbulb",
};
