import type { RectangleProbe } from "#src/models/genshinParity/probe/RectangleProbe";
import type { ImageRegion } from "#src/models/recreation/image/ImageRegion";

import { ProbeSide } from "#src/models/genshinParity/probe/ProbeSide";
import { readRectangleSide } from "#src/services/genshinParity/probe/readRectangleSide";
import { ParityReferenceMap } from "#src/services/genshinParity/shared/ParityReferenceMap";
import { getReferencePath } from "#src/services/genshinParity/shared/getReferencePath";
import { getShotPath } from "#src/services/genshinParity/shared/getShotPath";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { existsSync } from "node:fs";
import sharp from "sharp";

// A rectangle of a reference read on each side asked for: the reference's own pixels, and our last shot of its screen
// Sized to the reference, so the two rectangles lie over the same pixels. The rectangle must lie inside the reference
export const probeRectangle = async (
  referenceId: string,
  rect: ImageRegion,
  side: ProbeSide,
): Promise<RectangleProbe> => {
  const reference = ParityReferenceMap[referenceId];
  if (!reference)
    throw new InvalidOperationError(
      Operation.Read,
      referenceId,
      `not one of ${Object.keys(ParityReferenceMap).join(", ")}`,
    );
  const referencePath = getReferencePath(referenceId);
  if (!existsSync(referencePath))
    throw new InvalidOperationError(Operation.Read, referenceId, `no reference at ${referencePath}`);
  const { height, width } = await sharp(referencePath).metadata();
  const isInside =
    [rect.x, rect.y, rect.width, rect.height].every((value) => Number.isInteger(value)) &&
    rect.x >= 0 &&
    rect.y >= 0 &&
    rect.width >= 1 &&
    rect.height >= 1 &&
    rect.x + rect.width <= width &&
    rect.y + rect.height <= height;
  if (!isInside)
    throw new InvalidOperationError(
      Operation.Read,
      referenceId,
      `${JSON.stringify(rect)} is not a whole rectangle inside its ${width}×${height}`,
    );
  const probe: RectangleProbe = { rect };
  if (side !== ProbeSide.Ours) probe.reference = await readRectangleSide(sharp(referencePath), rect);
  if (side !== ProbeSide.Reference) {
    const shotPath = getShotPath(reference.screen);
    if (!existsSync(shotPath))
      throw new InvalidOperationError(
        Operation.Read,
        referenceId,
        `no shot of ${reference.screen} at ${shotPath}, so compare it first`,
      );
    probe.ours = await readRectangleSide(sharp(shotPath).resize(width, height, { fit: "fill" }), rect);
  }
  return probe;
};
