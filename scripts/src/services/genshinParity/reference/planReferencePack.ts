import type { ReferenceCollision } from "#src/models/genshinParity/reference/ReferenceCollision";
import type { ReferenceEntryPlan } from "#src/models/genshinParity/reference/ReferenceEntryPlan";
import type { ReferencePackDecision } from "#src/models/genshinParity/reference/ReferencePackDecision";
import type { ReferencePackOptions } from "#src/models/genshinParity/reference/ReferencePackOptions";

import { getReferenceFileName } from "#src/services/genshinParity/shared/getReferenceFileName";
import { InvalidOperationError, Operation } from "@esposter/shared";

const hasScreenshot = ({ id, missing }: ReferenceEntryPlan) => !missing.includes(getReferenceFileName(id));

// Decides what a pack stores from its plans and its options. A collision is one whose id is not replaced: `--skip-colliding`
// leaves it out of the manifest and the container, and without that flag it refuses the run. An id named by `--replace`
// takes its local bytes, so its plan is the one stored, and an id the map names with no screenshot is refused, not ignored
export const planReferencePack = (
  plans: ReferenceEntryPlan[],
  { replace, skipColliding }: ReferencePackOptions,
): ReferencePackDecision => {
  const unknown = replace.filter((id) => !plans.some((plan) => plan.id === id && hasScreenshot(plan)));
  if (unknown.length > 0)
    throw new InvalidOperationError(
      Operation.Read,
      unknown.join(", "),
      "is not a reference the map names with a screenshot, so it has no row to replace",
    );
  const collisions = plans
    .filter(({ id }) => !replace.includes(id))
    .flatMap(({ collisions }) => collisions)
    .filter((collision, index, all) => all.findIndex(({ id }) => id === collision.id) === index);
  const skipped: ReferenceCollision[] = skipColliding ? collisions : [];
  const skippedIds = skipped.map(({ id }) => id);
  return {
    blocked: skipColliding ? [] : collisions,
    replaced: plans.filter(({ id, row }) => replace.includes(id) && row !== undefined).map(({ id }) => id),
    skipped,
    stored: plans.filter(({ id }) => !skippedIds.includes(id)),
  };
};
