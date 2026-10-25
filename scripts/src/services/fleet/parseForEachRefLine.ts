import type { FleetRefLine } from "#src/models/fleet/FleetRefLine";

const LINE_REGEX = /^(?<sha>[0-9a-f]{40}) (?<id>\S+)(?: (?<message>.*))?$/u;

export const parseForEachRefLine = (line: string): FleetRefLine | undefined => {
  const groups = LINE_REGEX.exec(line)?.groups;
  if (groups === undefined) return undefined;
  return { id: groups.id ?? "", message: groups.message ?? "", sha: groups.sha ?? "" };
};
