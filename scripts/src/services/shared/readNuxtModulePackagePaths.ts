import { checkIsNuxtModuleManifest } from "#src/services/shared/checkIsNuxtModuleManifest";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { readWorkspacePackages } from "#src/services/shared/readWorkspacePackages";

// The workspace packages that are Nuxt modules, each as a path from the repository root
export const readNuxtModulePackagePaths = (): string[] =>
  readWorkspacePackages(REPOSITORY_ROOT)
    .filter(({ manifest }) => checkIsNuxtModuleManifest(manifest))
    .map(({ directory, workspaceDirectory }) =>
      workspaceDirectory ? `${workspaceDirectory}/${directory}` : directory,
    );
