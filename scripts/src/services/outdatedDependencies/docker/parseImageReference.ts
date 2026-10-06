import type { DependencyEntry } from "#src/models/outdatedDependencies/shared/DependencyEntry";

import { DependencyGroup } from "#src/models/outdatedDependencies/shared/DependencyGroup";
import { parseVersionTag } from "#src/services/outdatedDependencies/tag/parseVersionTag";

// `<image>:<tag>@sha256:<digest>`, the image taken lazily so a registry's port (`host:5000/image`) stays in it
const IMAGE_REFERENCE_REGEX = /^(?<image>[^@\s]+?):(?<tag>[^:@/\s]+)@(?<digest>sha256:[\da-f]{64})$/u;

// Undefined for a reference pinned to no versioned tag and digest, which leaves nothing to check it against
export const parseImageReference = (reference: string): DependencyEntry | undefined => {
  const groups = IMAGE_REFERENCE_REGEX.exec(reference)?.groups;
  return groups?.image && groups.tag && groups.digest && parseVersionTag(groups.tag)
    ? { digest: groups.digest, group: DependencyGroup.Docker, packageName: groups.image, specifier: groups.tag }
    : undefined;
};
