import { basename, dirname } from "node:path";

// The `node_modules` folder a package's directory sits in, which also holds its dependencies beside it. A scoped
// Package sits one level deeper, under its scope's folder
export const getContainingModulesDirectory = (packageDirectory: string): string => {
  const parentDirectory = dirname(packageDirectory);
  return basename(parentDirectory).startsWith("@") ? dirname(parentDirectory) : parentDirectory;
};
