/* eslint-disable perfectionist/sort-enums */
// Declaration order is the tab order — architecture leads, products are the main content,
// Packages and proposals trail.
export enum DocsCategory {
  Architecture = "Architecture",
  Products = "Products",
  Packages = "Packages",
  Proposals = "Proposals",
}

export const DocsCategories = Object.values(DocsCategory);
