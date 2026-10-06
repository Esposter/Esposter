import type { DependencyEntry } from "#src/models/outdatedDependencies/shared/DependencyEntry";
import type { Release } from "#src/models/outdatedDependencies/shared/Release";

import { getLatestCompatibleTag } from "#src/services/outdatedDependencies/tag/getLatestCompatibleTag";
import { fetchJson } from "#src/services/shared/fetchJson";
import { InvalidOperationError, Operation } from "@esposter/shared";

// A first path segment naming a host rather than a Docker Hub namespace, as Docker itself tells them apart
const REGISTRY_HOST_REGEX = /^(?:[^/]*[.:][^/]*|localhost)\//u;

// Docker Hub's: the registry's own tag list, which holds every tag in one answer, and the Hub's record of the digest
// The pinned tag points at now. An image on another registry is an error rather than a skip, so a new one is
// Reported the first time the report cannot read it
export const readDockerRelease = async ({ packageName, specifier }: DependencyEntry): Promise<Release> => {
  if (REGISTRY_HOST_REGEX.test(packageName))
    throw new InvalidOperationError(Operation.Read, readDockerRelease.name, `${packageName}: not on Docker Hub`);

  const repository = packageName.includes("/") ? packageName : `library/${packageName}`;
  const { token } = await fetchJson<{ token: string }>(
    `https://auth.docker.io/token?service=registry.docker.io&scope=repository:${repository}:pull`,
  );
  const [{ tags }, { digest }] = await Promise.all([
    fetchJson<{ tags: string[] }>(`https://registry-1.docker.io/v2/${repository}/tags/list`, {
      Authorization: `Bearer ${token}`,
    }),
    fetchJson<{ digest: string }>(`https://hub.docker.com/v2/repositories/${repository}/tags/${specifier}`),
  ]);
  return { digest, version: getLatestCompatibleTag(specifier, tags) };
};
