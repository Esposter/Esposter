// A workspace package by its name and its directory from the repository root, which is the prefix of every file it owns
export interface WorkspacePackage {
  directory: string;
  packageName: string;
}
