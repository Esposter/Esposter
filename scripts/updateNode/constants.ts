/* oxlint-disable typescript/no-inferrable-types */
// Anchored on the `runtime` object rather than on `devEngines`, because `devEngines` may also hold a
// `packageManager` object with a `version` of its own. Scanning from `devEngines` reaches whichever sibling is
// Declared first, which silently rewrites pnpm's version and leaves node's alone; `[^}]*` cannot cross the `}`
// That closes `runtime`, so anchoring here reads that object's own version or fails to match at all.
export const DEV_ENGINES_RUNTIME_VERSION_REGEX: RegExp =
  /(?<lead>"runtime":\s*\{[^}]*"version":\s*")(?<version>[^"]*)/u;

export const ENGINES_NODE_REGEX: RegExp = /(?<lead>"engines":\s*\{[^}]*"node":\s*")(?<version>[^"]*)/u;

export const TYPES_NODE_CATALOG_REGEX: RegExp = /(?<lead>"@types\/node":\s*)(?<version>\S+)/u;
