// Every open proposal is an OpenSpec change, one folder each, named `<area>-<slug>`
export const PROPOSALS_DIRECTORY = "openspec/changes";
// The folder `openspec archive` moves a shipped change into, which holds nothing open
export const ARCHIVE_FOLDER = "archive";
// The change's design: the lead naming what it waits on, the decisions and the Key files table
export const PROPOSAL_DESIGN_FILE = "design.md";
export const PROPOSAL_METADATA_FILE = ".openspec.yaml";
// An umbrella over the changes sharing its prefix — the decision and the build order — which they may wait on but which
// Is never a unit to build itself
export const PROGRAM_SUFFIX = "-program";
// Repo-wide refactor plans are no area: no roadmap, no reference product, no pass owed
export const REFACTORS_AREA = "refactors";
export const PRODUCT_REVIEW_SUBJECT_PREFIX = "docs(product-review): ";
