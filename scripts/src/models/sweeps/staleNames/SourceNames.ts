// The names the tracked tree holds, read two ways. `all` takes every source word, comments included, which is what a
// Page's citation is judged against. `code` takes the code alone, since a comment's own words cannot vouch for the
// Name it cites
export interface SourceNames {
  all: Set<string>;
  code: Set<string>;
}
