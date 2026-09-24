/* oxlint-disable typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this regex literal would otherwise infer */
export const TYPES_NODE_CATALOG_REGEX: RegExp = /(?<lead>"@types\/node":\s*)(?<version>\S+)/u;

// The one node pin: `pnpm/setup` installs it on the runners, fnm switches to it, Renovate's `nodenv` manager bumps it
export const NODE_VERSION_FILENAME = ".node-version";
