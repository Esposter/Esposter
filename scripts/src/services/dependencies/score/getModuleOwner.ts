import type { WorkspacePackage } from "#src/models/dependencies/score/WorkspacePackage";

import { APP_PACKAGE_NAME, NODE_MODULES_DIRECTORY, QUERY_REGEX } from "#src/services/dependencies/score/constants";

// The package a module of the client bundle belongs to: the package named after its last `node_modules` segment, scoped
// Names included; else the workspace package whose folder holds it; else the app's own code
export const getModuleOwner = (moduleId: string, workspacePackages: WorkspacePackage[]): string => {
  const path = `/${moduleId.replace(QUERY_REGEX, "").replaceAll("\\", "/")}`;
  const segments = path.split("/");
  const nodeModulesIndex = segments.lastIndexOf(NODE_MODULES_DIRECTORY);
  if (nodeModulesIndex !== -1) {
    const [name = "", scopedName = ""] = segments.slice(nodeModulesIndex + 1);
    return name.startsWith("@") ? `${name}/${scopedName}` : name;
  }

  const workspacePackage = workspacePackages.find(({ directory }) => path.includes(`/${directory}/`));
  return workspacePackage?.packageName ?? APP_PACKAGE_NAME;
};
