/* oxlint-disable @typescript-eslint/no-inferrable-types */
export const ENGINES_NODE_REGEX: RegExp = /(?<lead>"engines":\s*\{\s*"node":\s*")(?<version>[^"]*)/u;

export const TYPES_NODE_CATALOG_REGEX: RegExp = /(?<lead>"@types\/node":\s*)(?<version>\S+)/u;
