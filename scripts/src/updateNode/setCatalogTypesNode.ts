import { TYPES_NODE_CATALOG_REGEX } from "#src/updateNode/constants";
import { setVersion } from "#src/updateNode/setVersion";

/** Rewrite the `@types/node` catalog entry in a pnpm-workspace.yaml string to `^${version}`. */
export const setCatalogTypesNode = (workspaceYaml: string, version: string): string =>
  setVersion(workspaceYaml, TYPES_NODE_CATALOG_REGEX, version, "@types/node in pnpm-workspace.yaml");
