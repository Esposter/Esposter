/* oxlint-disable typescript/no-inferrable-types */
export const DEV_ENGINES_RUNTIME_VERSION_REGEX: RegExp =
  /(?<lead>"devEngines":\s*\{[^}]*"version":\s*")(?<version>[^"]*)/u;

export const ENGINES_NODE_REGEX: RegExp = /(?<lead>"engines":\s*\{[^}]*"node":\s*")(?<version>[^"]*)/u;

export const TYPES_NODE_CATALOG_REGEX: RegExp = /(?<lead>"@types\/node":\s*)(?<version>\S+)/u;
