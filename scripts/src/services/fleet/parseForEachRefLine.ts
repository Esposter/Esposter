// One line of `git for-each-ref --format='%(objectname) %(refname:lstrip=3) %(contents:subject)'`: the commit a ref
// Points at, the ref's last path segment, and its commit message's subject, which is the whole message for a claim
export interface FleetRefLine {
  id: string;
  message: string;
  sha: string;
}

const LINE_REGEX = /^(?<sha>[0-9a-f]{40}) (?<id>\S+)(?: (?<message>.*))?$/u;

export const parseForEachRefLine = (line: string): FleetRefLine | undefined => {
  const groups = LINE_REGEX.exec(line)?.groups;
  if (groups === undefined) return undefined;
  return { id: groups.id ?? "", message: groups.message ?? "", sha: groups.sha ?? "" };
};
