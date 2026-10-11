export interface PathFilterGlobs {
  // The globs a `!` path filter leaves out of the review, its `!` dropped
  excludedGlobs: string[];
  // The globs the path filters keep the review to; none keeps every path
  includedGlobs: string[];
}
