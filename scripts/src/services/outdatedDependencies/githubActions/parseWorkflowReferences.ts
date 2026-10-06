import type { ReferenceScan } from "#src/models/outdatedDependencies/shared/ReferenceScan";

import { DependencyGroup } from "#src/models/outdatedDependencies/shared/DependencyGroup";
import { parseImageReference } from "#src/services/outdatedDependencies/docker/parseImageReference";
import { parseVersionTag } from "#src/services/outdatedDependencies/tag/parseVersionTag";

const USES_REGEX =
  /^[ \t]*(?:-[ \t]+)?uses:[ \t]*["']?(?<reference>[^\s"'#]*)["']?(?:[ \t]+#[ \t]*(?<comment>\S+))?/gmu;
// `<owner>/<repo>`, then an action's path inside the repository, then its ref
const ACTION_REFERENCE_REGEX = /^(?<repository>[^/@\s]+\/[^/@\s]+)(?:\/[^@\s]*)?@(?<ref>\S+)$/u;
const COMMIT_SHA_REGEX = /^[\da-f]{40}$/u;
const RUNS_ON_REGEX = /^[ \t]*runs-on:[ \t]*["']?(?<label>[^\s"'#]*)/gmu;
const RUNNER_LABEL_REGEX = /^(?<os>[a-z]+)-(?<version>\d+(?:\.\d+)*)$/u;
const DOCKER_SCHEME = "docker://";
const LATEST_RUNNER_SUFFIX = "-latest";

// Every action, image and runner a workflow or a composite action names. An action is pinned when its ref is a commit
// With the version it was tagged as in the comment beside it — the shape `helpers:pinGitHubActionDigests` writes — and
// A local one is the repository's own code. A runner's `-latest` label moves by itself, so only a versioned one is a
// Pin; anything else it names (an expression, a list) is one the report cannot read
export const parseWorkflowReferences = (path: string, text: string): ReferenceScan => {
  const scan: ReferenceScan = { entries: [], unpinned: [] };

  for (const { groups } of text.matchAll(USES_REGEX)) {
    const reference = groups?.reference ?? "";
    if (reference.startsWith("./")) continue;

    if (reference.startsWith(DOCKER_SCHEME)) {
      const image = reference.slice(DOCKER_SCHEME.length);
      const entry = parseImageReference(image);
      if (entry) scan.entries.push(entry);
      else scan.unpinned.push({ packageName: image, path, reference });
      continue;
    }

    const actionGroups = ACTION_REFERENCE_REGEX.exec(reference)?.groups;
    const repository = actionGroups?.repository ?? reference;
    const comment = groups?.comment ?? "";
    if (actionGroups?.ref && COMMIT_SHA_REGEX.test(actionGroups.ref) && parseVersionTag(comment))
      scan.entries.push({
        digest: actionGroups.ref,
        group: DependencyGroup.GitHubActions,
        packageName: repository,
        specifier: comment,
      });
    else scan.unpinned.push({ packageName: repository, path, reference });
  }

  for (const { groups } of text.matchAll(RUNS_ON_REGEX)) {
    const label = groups?.label ?? "";
    if (label.endsWith(LATEST_RUNNER_SUFFIX)) continue;

    const runnerGroups = RUNNER_LABEL_REGEX.exec(label)?.groups;
    if (runnerGroups?.os && runnerGroups.version)
      scan.entries.push({
        group: DependencyGroup.GitHubRunners,
        packageName: runnerGroups.os,
        specifier: runnerGroups.version,
      });
    else scan.unpinned.push({ packageName: label, path, reference: `runs-on: ${label}` });
  }

  return scan;
};
