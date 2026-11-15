// Values double as the dropdown's group subheader titles
export const ResourceSearchGroup = {
  Pages: "Pages",
  RecentlyOpened: "Recently opened",
  RecentSearches: "Recent searches",
  Resources: "Resources",
  Services: "Services",
} as const;
export type ResourceSearchGroup = (typeof ResourceSearchGroup)[keyof typeof ResourceSearchGroup];
