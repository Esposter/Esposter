import type { AudioChannels } from "#src/models/AudioChannels";
import type { ModelReadings } from "#src/models/ModelReadings";
import type { InferenceSession } from "onnxruntime-common";

import { ANNOTATIONS_FPS, AUDIO_SAMPLE_RATE } from "#src/constants";
import { mixDownChannels } from "#src/services/mixDownChannels";
import { prepareAudioWindows } from "#src/services/prepareAudioWindows";
import { readWindow } from "#src/services/readModel/readWindow";

// The model's readings over a recording, read a window at a time: each window's frame, onset and contour readings,
// Trimmed of their overlap and of anything past the recording's end, are handed to `onWindow` with the share of the
// Recording read so far, and returned together. Each window's outputs are disposed once read, and no window past the
// Recording's last frame is run
export const readModel = async (
  session: Pick<InferenceSession, "run">,
  audio: AudioChannels | Float32Array,
  onWindow?: (readings: ModelReadings, progress: number) => void,
): Promise<ModelReadings> => {
  const samples = mixDownChannels(audio);
  const frameCount = Math.floor((samples.length * ANNOTATIONS_FPS) / AUDIO_SAMPLE_RATE);
  const windows = prepareAudioWindows(samples);
  const readings: ModelReadings = { contours: [], frames: [], onsets: [] };

  for (let index = 0; index < windows.count && readings.frames.length < frameCount; index++) {
    const remainingFrames = frameCount - readings.frames.length;
    // Each window waits for the last so only one window's outputs are ever held
    // oxlint-disable-next-line no-await-in-loop -- one window's outputs held at a time is the point
    const windowReadings = await readWindow(session, windows.getWindow(index), remainingFrames);
    readings.frames.push(...windowReadings.frames);
    readings.onsets.push(...windowReadings.onsets);
    readings.contours.push(...windowReadings.contours);
    onWindow?.(windowReadings, readings.frames.length / frameCount);
  }
  return readings;
};
