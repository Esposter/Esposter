/* eslint-disable perfectionist/sort-enums */
// Declaration order is the sidebar sort order — architecture leads, lifecycle folders trail
// Their area's feature pages, proposals trail the whole tree. Unlisted slugs (areas and
// Feature pages) sort between Architecture and Roadmap via DEFAULT_DOCS_NAVIGATION_WEIGHT.
export enum DocsNavigationSlug {
  Architecture = "architecture",
  Roadmap = "roadmap",
  Deferred = "deferred",
  Rejected = "rejected",
  Proposals = "proposals",
}
