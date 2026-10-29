import type { ParityApproval } from "#src/models/genshinParity/shared/ParityApproval";

import { ParityApprovalMeasure } from "#src/models/genshinParity/reference/ParityApprovalMeasure";
import { PARITY_SHARED_DIRECTORY, STRUCTURE_WIDTH } from "#src/services/genshinParity/shared/constants";
import { join } from "node:path";

// The detail read at twice the structure's width, where a stone's carving and its courses still show
export const DETAIL_WIDTH: number = STRUCTURE_WIDTH * 2;

// The hex digits of a reference's content hash kept in its cache name
export const DIGEST_LENGTH = 16;

// Each image of a comparison is drawn this high, side by side
export const COMPARISON_HEIGHT = 540;

// The mean difference, in percent, a shot must score under its reference to be approved: one percent is the 99%
// Likeness the screens are held to. A reference that records its own approval keeps that bar instead
const APPROVAL_MEAN_DIFFERENCE_BAR = 1;

// The approval a screen gets when its reference records none
export const DEFAULT_APPROVAL: ParityApproval = Object.freeze({
  bar: APPROVAL_MEAN_DIFFERENCE_BAR,
  measure: ParityApprovalMeasure.MeanDifference,
} satisfies ParityApproval);

// The committed report of every reference's last scores, beside the map naming them
export const PARITY_SCORES_PATH: string = join(PARITY_SHARED_DIRECTORY, "ParityReferenceMap.snapshot.md");
