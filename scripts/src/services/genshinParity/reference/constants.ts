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

// The mean difference, in percent, a shot must score under its reference to be within the bar: one percent is the 99%
// Likeness the screens are held to. A reference that records its own bar keeps that bar instead
const APPROVAL_MEAN_DIFFERENCE_BAR = 1;

// The bar a screen is set against when its reference records none
export const DEFAULT_APPROVAL: ParityApproval = Object.freeze({
  bar: APPROVAL_MEAN_DIFFERENCE_BAR,
  measure: ParityApprovalMeasure.MeanDifference,
} satisfies ParityApproval);

// The committed report of every reference's last scores, beside the map naming them
export const PARITY_SCORES_PATH: string = join(PARITY_SHARED_DIRECTORY, "ParityReferenceMap.snapshot.md");

// The conversion a frame is cut with, its colour tags set to unknown so a browser does not colour-manage the cut
export const RECORDING_FRAME_FILTER =
  "format=rgb24,setparams=color_primaries=unknown:color_trc=unknown:colorspace=unknown";

// The largest mean difference, in percent of full scale, a reference may have from the frame its source names. Older
// Cuts differ from their recordings by up to about 0.39%, a uniform darkening from an earlier pipeline, while a different
// Picture scores in the tens of percent, so one percent sits well above the first and far below the second
export const VERIFY_TOLERANCE_PERCENT = 1;
