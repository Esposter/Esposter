import { TYPES_NODE_CATALOG_REGEX } from "@/updateNode/constants";

/** Rewrite the `@types/node` catalog entry in a pnpm-workspace.yaml string to `^${version}`. */
export const setCatalogTypesNode = (workspaceYaml: string, version: string): string => {
  if (!TYPES_NODE_CATALOG_REGEX.test(workspaceYaml))
    throw new Error("Could not find @types/node in pnpm-workspace.yaml");

  return workspaceYaml.replace(TYPES_NODE_CATALOG_REGEX, `$<lead>^${version}`);
};
