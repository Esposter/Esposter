import { dirname } from "node:path";

// The `node_modules` a package's dependencies sit in, beside its realpath under pnpm's store layout: a scoped package's
// Realpath is two directories below it, an unscoped one a single directory
export const getNodeModulesDirectory = (packageName: string, realDirectory: string): string =>
  packageName.startsWith("@") ? dirname(dirname(realDirectory)) : dirname(realDirectory);
