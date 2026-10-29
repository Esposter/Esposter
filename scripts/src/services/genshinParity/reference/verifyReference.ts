import type { ParityReference } from "#src/models/genshinParity/shared/ParityReference";
import type { ReferenceVerification } from "#src/models/genshinParity/reference/ReferenceVerification";
import type { VerifyPaths } from "#src/models/genshinParity/reference/VerifyPaths";

import { VerifyOutcome } from "#src/models/genshinParity/reference/VerifyOutcome";
import { cutRecordingFrame } from "#src/services/genshinParity/reference/cutRecordingFrame";
import { getOutsideRegion } from "#src/services/genshinParity/reference/getOutsideRegion";
import { isWithinVerifyTolerance } from "#src/services/genshinParity/reference/isWithinVerifyTolerance";
import { measureMeanDifference } from "#src/services/genshinParity/reference/measureMeanDifference";
import { parseRecordingSource } from "#src/services/genshinParity/reference/parseRecordingSource";
import { readImageSize } from "#src/services/genshinParity/reference/readImageSize";
import { VERIFY_TOLERANCE_PERCENT } from "#src/services/genshinParity/reference/constants";
import { existsSync } from "node:fs";
import { join } from "node:path";

// Checks one reference against the frame its source names: its rectangles must lie within its file, then the frame is
// Cut from the recording and the two are measured over the reference's region. A missing file or recording is skipped
export const verifyReference = async (
  referenceId: string,
  source: string,
  reference: ParityReference,
  paths: VerifyPaths,
): Promise<ReferenceVerification> => {
  const referencePath = paths.referencePath(referenceId);
  if (!existsSync(referencePath))
    return { id: referenceId, message: `no reference at ${referencePath}`, outcome: VerifyOutcome.Skipped };
  const file = await readImageSize(referencePath);
  const outside = getOutsideRegion(reference, file);
  if (outside !== undefined)
    return {
      id: referenceId,
      message: `${outside}, outside its ${file.width}×${file.height} file`,
      outcome: VerifyOutcome.Fail,
    };
  const recording = parseRecordingSource(source);
  const recordingPath = join(paths.capturesDirectory, recording.file);
  if (!existsSync(recordingPath))
    return { id: referenceId, message: `no recording at ${recordingPath}`, outcome: VerifyOutcome.Skipped };
  const cutPath = join(paths.cutDirectory, `${referenceId}.png`);
  await cutRecordingFrame(recording, recordingPath, cutPath);
  const cut = await readImageSize(cutPath);
  // A cropped source's file may be shorter than its cut, by the rows past its end: the rows the two share are measured
  const sharesRows = recording.crop !== undefined && cut.width === file.width && file.height < cut.height;
  if (!sharesRows && (cut.width !== file.width || cut.height !== file.height))
    return {
      id: referenceId,
      message: `the cut is ${cut.width}×${cut.height}, the file ${file.width}×${file.height}`,
      outcome: VerifyOutcome.Fail,
    };
  const region = reference.region ?? { height: file.height, width: file.width, x: 0, y: 0 };
  const meanDifferencePercent = await measureMeanDifference(cutPath, referencePath, region);
  const measure = `${meanDifferencePercent.toFixed(2)}% mean difference over ${region.width}×${region.height}`;
  if (!isWithinVerifyTolerance(meanDifferencePercent))
    return {
      id: referenceId,
      message: `${measure}, over the ${VERIFY_TOLERANCE_PERCENT}% tolerance`,
      outcome: VerifyOutcome.Fail,
    };
  return { id: referenceId, message: measure, outcome: VerifyOutcome.Pass };
};
