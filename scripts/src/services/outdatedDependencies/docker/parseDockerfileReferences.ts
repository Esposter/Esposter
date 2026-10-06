import type { ReferenceScan } from "#src/models/outdatedDependencies/shared/ReferenceScan";

import { parseImageReference } from "#src/services/outdatedDependencies/docker/parseImageReference";

const FROM_REGEX = /^FROM\s+(?:--\S+\s+)*(?<reference>\S+)(?:\s+AS\s+(?<stage>\S+))?/gimu;
// The empty image, which has no version to pin
const SCRATCH = "scratch";

// Every image a Dockerfile builds from. A `FROM` naming an earlier stage builds from that stage rather than from an
// Image, so it is no reference at all
export const parseDockerfileReferences = (path: string, text: string): ReferenceScan => {
  const scan: ReferenceScan = { entries: [], unpinned: [] };
  const stages = new Set<string>([SCRATCH]);
  for (const { groups } of text.matchAll(FROM_REGEX)) {
    const reference = groups?.reference ?? "";
    if (!stages.has(reference.toLowerCase())) {
      const entry = parseImageReference(reference);
      if (entry) scan.entries.push(entry);
      else scan.unpinned.push({ packageName: reference, path, reference });
    }
    if (groups?.stage) stages.add(groups.stage.toLowerCase());
  }
  return scan;
};
