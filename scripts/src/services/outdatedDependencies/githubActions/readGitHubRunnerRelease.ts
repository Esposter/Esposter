import type { DependencyEntry } from "#src/models/outdatedDependencies/shared/DependencyEntry";
import type { Release } from "#src/models/outdatedDependencies/shared/Release";

import { getLatestCompatibleTag } from "#src/services/outdatedDependencies/tag/getLatestCompatibleTag";
import { fetchJson } from "#src/services/shared/fetchJson";

// The runner images GitHub builds, one readme per image (`Ubuntu2604-Readme.md`), which is the list Renovate's
// `github-runners` datasource follows. An image's variants (`-Arm64-`) carry a word between the version and the
// `-Readme`, so they never match. A version written with a dot (`26.04`) is rebuilt in that shape
export const readGitHubRunnerRelease = async ({ packageName, specifier }: DependencyEntry): Promise<Release> => {
  const files = await fetchJson<{ name: string }[]>(
    `https://api.github.com/repos/actions/runner-images/contents/images/${packageName}`,
  );
  const readmeRegex = new RegExp(`^${packageName}(?<digits>\d+)-Readme\.md$`, "iu");
  const versions = files.flatMap(({ name }) => {
    const digits = readmeRegex.exec(name)?.groups?.digits;
    if (!digits) return [];
    return [specifier.includes(".") ? `${digits.slice(0, 2)}.${digits.slice(2)}` : digits];
  });
  return { version: getLatestCompatibleTag(specifier, versions) };
};
