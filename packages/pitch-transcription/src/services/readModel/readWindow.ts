import type { ModelReadings } from "#src/models/ModelReadings";
import type { InferenceSession, Tensor } from "onnxruntime-common";

import {
  ANNOTATIONS_SEMITONES,
  CONTOUR_BINS,
  CONTOURS_TENSOR,
  FRAMES_TENSOR,
  INPUT_TENSOR,
  ONSETS_TENSOR,
} from "#src/constants";
import { readOutput } from "#src/services/readModel/readOutput";

// One window run, its frame, onset and contour readings trimmed to the frames still wanted
export const readWindow = async (
  session: Pick<InferenceSession, "run">,
  window: Tensor,
  remainingFrames: number,
): Promise<ModelReadings> => {
  const outputs = await session.run({ [INPUT_TENSOR]: window }, [FRAMES_TENSOR, ONSETS_TENSOR, CONTOURS_TENSOR]);
  const [frames, onsets, contours] = await Promise.all([
    readOutput(outputs, FRAMES_TENSOR, ANNOTATIONS_SEMITONES),
    readOutput(outputs, ONSETS_TENSOR, ANNOTATIONS_SEMITONES),
    readOutput(outputs, CONTOURS_TENSOR, CONTOUR_BINS),
  ]);
  return {
    contours: contours.slice(0, remainingFrames),
    frames: frames.slice(0, remainingFrames),
    onsets: onsets.slice(0, remainingFrames),
  };
};
