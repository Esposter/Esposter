import type { GroupMetadata } from "#src/models/outdatedDependencies/registry/GroupMetadata";

import { DependencyGroup } from "#src/models/outdatedDependencies/shared/DependencyGroup";
import { readDockerRelease } from "#src/services/outdatedDependencies/docker/readDockerRelease";
import { readGitHubActionRelease } from "#src/services/outdatedDependencies/githubActions/readGitHubActionRelease";
import { readGitHubRunnerRelease } from "#src/services/outdatedDependencies/githubActions/readGitHubRunnerRelease";
import { readNpmRelease } from "#src/services/outdatedDependencies/registry/readNpmRelease";

// A catalog entry reaches the registry only when a `renovate.json` rule follows a dist-tag for it; every other
// One is checked against the lockfile. An npm entry names its own manifest as the dependent, so the label here
// Is what it falls back to.
export const GroupMetadataMap: Record<DependencyGroup, GroupMetadata> = {
  [DependencyGroup.Catalog]: { dependencyType: "", dependent: DependencyGroup.Catalog, readRelease: readNpmRelease },
  [DependencyGroup.ConfigDependencies]: {
    dependencyType: "config",
    dependent: DependencyGroup.ConfigDependencies,
    readRelease: readNpmRelease,
  },
  [DependencyGroup.Docker]: {
    dependencyType: "docker",
    dependent: DependencyGroup.Docker,
    readRelease: readDockerRelease,
  },
  [DependencyGroup.Engines]: {
    dependencyType: "engine",
    dependent: DependencyGroup.Engines,
    readRelease: readNpmRelease,
  },
  [DependencyGroup.GitHubActions]: {
    dependencyType: "action",
    dependent: DependencyGroup.GitHubActions,
    readRelease: readGitHubActionRelease,
  },
  [DependencyGroup.GitHubRunners]: {
    dependencyType: "runner",
    dependent: DependencyGroup.GitHubRunners,
    readRelease: readGitHubRunnerRelease,
  },
  [DependencyGroup.NodeVersion]: {
    dependencyType: "node",
    dependent: DependencyGroup.NodeVersion,
    readRelease: readNpmRelease,
  },
  [DependencyGroup.Npm]: { dependencyType: "npm", dependent: DependencyGroup.Npm, readRelease: readNpmRelease },
  [DependencyGroup.Overrides]: {
    dependencyType: "override",
    dependent: DependencyGroup.Overrides,
    readRelease: readNpmRelease,
  },
  [DependencyGroup.PackageManager]: {
    dependencyType: "packageManager",
    dependent: DependencyGroup.PackageManager,
    readRelease: readNpmRelease,
  },
};
