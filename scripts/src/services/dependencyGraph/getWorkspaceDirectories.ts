import type { WorkspacePackage } from "#src/models/shared/WorkspacePackage";

// In the order the members come in, which `readWorkspacePackages` sorts by path — so the clusters are drawn
// In the same order however the workspace file happens to list its globs.
export const getWorkspaceDirectories = (workspacePackages: WorkspacePackage[]): string[] => [
  ...new Set(
    workspacePackages.flatMap(({ workspaceDirectory }) => (workspaceDirectory === "" ? [] : [workspaceDirectory])),
  ),
];
