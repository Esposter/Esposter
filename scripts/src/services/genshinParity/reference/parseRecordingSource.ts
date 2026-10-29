import type { RecordingSource } from "#src/models/genshinParity/reference/RecordingSource";

import { RECORDING_SOURCE_REGEX } from "#src/services/genshinParity/reference/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";

// A reference's source, `<file> at <N>s`, with `, cropped to WxH from X,Y` when the frame is cropped: the recording's
// File name, the second its frame is cut at, and the crop, each read off the string as the map writes it
export const parseRecordingSource = (source: string): RecordingSource => {
  const match = RECORDING_SOURCE_REGEX.exec(source);
  const [, file, second, width, height, x, y] = match ?? [];
  if (file === undefined || second === undefined)
    throw new InvalidOperationError(Operation.Read, source, "not a recording source as `<file> at <N>s`");
  const recording: RecordingSource = { file, second: Number(second) };
  if (width === undefined || height === undefined || x === undefined || y === undefined) return recording;
  return { ...recording, crop: { height: Number(height), width: Number(width), x: Number(x), y: Number(y) } };
};
