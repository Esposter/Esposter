import type { AudioChannels } from "#src/models/AudioChannels";
import type { ModelReadings } from "#src/models/ModelReadings";
import type { GraphModel, Tensor3D } from "@tensorflow/tfjs";

import { ANNOTATIONS_FPS, AUDIO_SAMPLE_RATE, CONTOURS_TENSOR, FRAMES_TENSOR, ONSETS_TENSOR } from "#src/constants";
import { mixDownChannels } from "#src/services/mixDownChannels";
import { prepareAudioWindows } from "#src/services/prepareAudioWindows";
import { unwrapWindowReadings } from "#src/services/unwrapWindowReadings";
import { withFinalizerAsync } from "@esposter/shared";
import { dispose, slice, tidy } from "@tensorflow/tfjs";

// The model's readings over a recording, read a window at a time: each window's frame, onset and contour readings,
// Trimmed of their overlap and of anything past the recording's end, are handed to `onWindow` with the share of the
// Recording read so far, and returned together. Each window's tensors are freed once read, and no window past the
// Recording's last frame is run. The windows are freed however the read ends
export const readModel = (
  model: Pick<GraphModel, "execute">,
  audio: AudioChannels | Float32Array,
  onWindow?: (readings: ModelReadings, progress: number) => void,
): Promise<ModelReadings> => {
  const samples = mixDownChannels(audio);
  const frameCount = Math.floor((samples.length * ANNOTATIONS_FPS) / AUDIO_SAMPLE_RATE);
  const windows = prepareAudioWindows(samples);
  return withFinalizerAsync(
    async () => {
      const readings: ModelReadings = { contours: [], frames: [], onsets: [] };

      for (let index = 0; index < windows.shape[0] && readings.frames.length < frameCount; index++) {
        const remainingFrames = frameCount - readings.frames.length;
        const outputs = tidy(() => {
          const window = slice(windows, index, 1);
          const windowOutputs = model.execute(window, [FRAMES_TENSOR, ONSETS_TENSOR, CONTOURS_TENSOR]) as Tensor3D[];
          return windowOutputs.map((output) => {
            const unwrapped = unwrapWindowReadings(output);
            return unwrapped.slice(0, Math.min(remainingFrames, unwrapped.shape[0]));
          });
        });
        // Each window waits for the last so only one window's tensors are ever held
        // oxlint-disable-next-line no-await-in-loop -- one window's tensors held at a time is the point
        const [frames = [], onsets = [], contours = []] = await Promise.all(outputs.map((output) => output.array()));
        dispose(outputs);
        readings.frames.push(...frames);
        readings.onsets.push(...onsets);
        readings.contours.push(...contours);
        onWindow?.({ contours, frames, onsets }, readings.frames.length / frameCount);
      }
      return readings;
    },
    () => {
      windows.dispose();
    },
  );
};
