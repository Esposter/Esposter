/* oxlint-disable typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this regex literal would otherwise infer */
export const TYPES_NODE_CATALOG_REGEX: RegExp = /(?<lead>"@types\/node":\s*)(?<version>\S+)/u;
// The one node pin: `pnpm/setup` installs it on the runners, the global `vp` resolves it locally, Renovate's `nodenv`
// Manager bumps it
export const NODE_VERSION_FILENAME = ".node-version";
// A manifest's `engines.node` value, wherever `node` sits among the flat `engines` object's keys, in a package.json or a
// Lockfile root entry
export const ENGINES_NODE_REGEX: RegExp = /(?<lead>"engines":\s*\{[^{}]*?"node":\s*")[^"]*/u;
// The `devEngines` key, after which only that field's runtime entries are edited
export const DEV_ENGINES_KEY = '"devEngines"';
// A flat object in a `devEngines` runtime field, the object form or one entry of the array form
export const FLAT_OBJECT_REGEX: RegExp = /\{[^{}]*\}/gu;
export const NODE_RUNTIME_NAME_REGEX: RegExp = /"name":\s*"node"/u;
export const RUNTIME_VERSION_REGEX: RegExp = /(?<lead>"version":\s*")[^"]*/u;
// The `packages[""]` root entry of an npm lockfile, which is the first entry at this indent
export const LOCKFILE_ROOT_ENTRY_REGEX: RegExp = /\n {4}"": \{/u;
// The next entry of `packages` after the root, at the same indent as the root's own key
export const LOCKFILE_NEXT_ENTRY_KEY = '\n    "';
