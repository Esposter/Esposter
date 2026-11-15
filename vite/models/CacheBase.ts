// The directory a task's cache pattern is resolved from, as `vp` names it
export const CacheBase = { Package: "package", Workspace: "workspace" } as const;
export type CacheBase = (typeof CacheBase)[keyof typeof CacheBase];
