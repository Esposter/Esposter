export enum SourceType {
  // A directory already on the host disk; used as the working directory directly, nothing copied.
  Dir = "dir",
  // An in-memory map of relative path -> file content, materialized into a temp directory.
  Files = "files",
  // A git remote (or local repo) shallow-cloned into a temp directory.
  Git = "git",
}
