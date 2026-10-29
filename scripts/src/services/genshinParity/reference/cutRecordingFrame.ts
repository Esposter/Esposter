import type { RecordingSource } from "#src/models/genshinParity/reference/RecordingSource";

import { RECORDING_FRAME_FILTER } from "#src/services/genshinParity/reference/constants";
import { runFfmpeg } from "#src/services/recreation/video/runFfmpeg";

// Cuts the frame a recording source names into a PNG the documented way: the seek is before the input, since an output
// Seek lands on a different frame, and the source's crop is placed before the colour conversion
export const cutRecordingFrame = (source: RecordingSource, recordingPath: string, cutPath: string): Promise<void> => {
  const filters = source.crop
    ? [`crop=${source.crop.width}:${source.crop.height}:${source.crop.x}:${source.crop.y}`, RECORDING_FRAME_FILTER]
    : [RECORDING_FRAME_FILTER];
  return runFfmpeg([
    "-ss",
    String(source.second),
    "-i",
    recordingPath,
    "-frames:v",
    "1",
    "-vf",
    filters.join(","),
    cutPath,
  ]);
};
