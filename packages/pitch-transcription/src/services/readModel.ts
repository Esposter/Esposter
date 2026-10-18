import type { AudioChannels } from "#src/models/AudioChannels";
import type { ModelReadings } from "#src/models/ModelReadings";
import type { InferenceSession, Tensor } from "onnxruntime-common";

import {
  ANNOTATIONS_FPS,
  ANNOTATIONS_SEMITONES,
  AUDIO_SAMPLE_RATE,
  CONTOUR_BINS,
  CONTOURS_TENSOR,
  FRAMES_TENSOR,
  INPUT_TENSOR,
  ONSETS_TENSOR,
} from "#src/constants";
import { mixDownChannels } from "#src/services/mixDownChannels";
import { prepareAudioWindows } from "#src/services/prepareAudioWindows";
import { unwrapWindowReadings } from "#src/services/unwrapWindowReadings";
import { InvalidOperationError, Operation, takeOne } from "@esposter/shared";

// One output read as its rows, then disposed. The values are read before the output is disposed, since disposing a GPU
// Tensor releases its data and a CPU tensor's values are only held by the array read from it
const readOutput = async (
  outputs: InferenceSession.ReturnType,
  name: string,
  binCount: number,
): Promise<number[][]> => {
  const output = takeOne(outputs, name);
  const data = await output.getData();
  output.dispose();
  if (!(data instanceof Float32Array))
    throw new InvalidOperationError(
      Operation.Read,
      readOutput.name,
      `${name} as ${output.type}, the model writes float32`,
    );
  return unwrapWindowReadings(data, binCount);
};
// One window run, its frame, onset and contour readings trimmed to the frames still wanted
const readWindow = async (
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
