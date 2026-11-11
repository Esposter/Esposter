// Which directory a cache glob is resolved from: the package of the task's `cwd`, or the workspace root
export enum CachePatternBase {
  Package = "package",
  Workspace = "workspace",
}
