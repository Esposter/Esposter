import type { DependencyEntry } from "#src/models/outdatedDependencies/shared/DependencyEntry";
import type { Release } from "#src/models/outdatedDependencies/shared/Release";

import { getLatestCompatibleTag } from "#src/services/outdatedDependencies/tag/getLatestCompatibleTag";
import { FETCH_TIMEOUT_MS, MAX_BUFFER_BYTES } from "#src/services/shared/constants";
import { getNonEmptyLines } from "#src/services/shared/getNonEmptyLines";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const TAG_REF_REGEX = /^(?<sha>[\da-f]{40})\trefs\/tags\/(?<tag>[^^\s]+)(?<peeled>\^\{\})?$/u;

// The repository's tags as git itself lists them, with no API and so no rate limit. An annotated tag is listed twice,
// The second time peeled to the commit it tags, which is the sha a pin holds — so a peeled line overrides the tag
// Object's. Bounded like every request a script makes, so a stalled remote is an error row rather than a hung run
export const readGitHubActionRelease = async ({ packageName, specifier }: DependencyEntry): Promise<Release> => {
  const { stdout } = await promisify(execFile)(
    "git",
    ["ls-remote", "--tags", `https://github.com/${packageName}.git`],
    { encoding: "utf8", maxBuffer: MAX_BUFFER_BYTES, timeout: FETCH_TIMEOUT_MS },
  );
  const tagCommitMap = new Map<string, string>();
  for (const line of getNonEmptyLines(stdout)) {
    const groups = TAG_REF_REGEX.exec(line)?.groups;
    if (groups?.sha && groups.tag && (groups.peeled || !tagCommitMap.has(groups.tag)))
      tagCommitMap.set(groups.tag, groups.sha);
  }
  return { digest: tagCommitMap.get(specifier), version: getLatestCompatibleTag(specifier, [...tagCommitMap.keys()]) };
};
