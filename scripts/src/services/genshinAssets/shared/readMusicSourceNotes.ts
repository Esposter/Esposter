import type { ModelReadings } from "pitch-transcription";

import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { loadGraphModelSync } from "@tensorflow/tfjs";
import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import {
  ANNOTATIONS_SEMITONES,
  convertNotesToSeconds,
  createNotes,
  MODEL_URL,
  MODEL_WEIGHTS_URL,
  readModel,
} from "pitch-transcription";

// The notes a decoded source plays, as pitch-transcription hears them at its defaults, with no pitch bends: the model's
// Frame and onset readings are kept beside the source as 32-bit floats, frames then onsets, so a second fit reads them
// In a moment rather than running the model over the whole source again
export const readMusicSourceNotes = async (
  wavePath: string,
  samples: Float32Array,
): Promise<ReturnType<typeof convertNotesToSeconds>> => {
  const readingsPath = wavePath.replace(/\.wav$/u, ".readings.bin");
  let readings: Pick<ModelReadings, "frames" | "onsets">;
  if (existsSync(readingsPath)) {
    const data = await readFile(readingsPath);
    const values = new Float32Array(data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength));
    const frameCount = values.length / ANNOTATIONS_SEMITONES / 2;
    const getRows = (offset: number): number[][] =>
      Array.from({ length: frameCount }, (_, frame) => [
        ...values.subarray((offset + frame) * ANNOTATIONS_SEMITONES, (offset + frame + 1) * ANNOTATIONS_SEMITONES),
      ]);
    readings = { frames: getRows(0), onsets: getRows(frameCount) };
  } else {
    const [modelJson, weights] = await Promise.all([readFile(MODEL_URL, "utf8"), readFile(MODEL_WEIGHTS_URL)]);
    const model = loadGraphModelSync([parseMachineJson(modelJson), new Uint8Array(weights).buffer]);
    readings = await readModel(model, samples);
    await writeFile(readingsPath, Float32Array.from([...readings.frames.flat(), ...readings.onsets.flat()]));
  }
  return convertNotesToSeconds(createNotes(readings));
};
