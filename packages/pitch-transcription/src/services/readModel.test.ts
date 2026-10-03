import type { GraphModel, io } from "@tensorflow/tfjs";

import { AUDIO_SAMPLE_RATE, MODEL_URL, MODEL_WEIGHTS_URL } from "#src/constants";
import { createNotes } from "#src/services/createNotes";
import { readModel } from "#src/services/readModel";
import { loadGraphModelSync, memory } from "@tensorflow/tfjs";
import { readFile } from "node:fs/promises";
import { describe, expect, test, vi } from "vitest";

const readShippedModel = async (): Promise<GraphModel<io.IOHandlerSync>> => {
  const [modelJson, weights] = await Promise.all([readFile(MODEL_URL, "utf8"), readFile(MODEL_WEIGHTS_URL)]);
  return loadGraphModelSync([JSON.parse(modelJson), new Uint8Array(weights).buffer]);
};
// A tone at A4 whose frames the model's first window covers, though its samples run into a second window
const tone = Float32Array.from(
  { length: 36000 },
  (_, index) => Math.sin((2 * Math.PI * 440 * index) / AUDIO_SAMPLE_RATE) / 2,
);

describe(readModel, () => {
  test("hears a tone's pitch", async () => {
    expect.hasAssertions();

    const model = await readShippedModel();
    const readings = await readModel(model, tone);

    expect(new Set(createNotes(readings).map(({ pitchMidi }) => pitchMidi))).toStrictEqual(new Set([69]));
  });

  test("frees every tensor it makes", async () => {
    expect.hasAssertions();

    const model = await readShippedModel();
    const { numTensors } = memory();
    await readModel(model, tone);

    expect(memory().numTensors).toBe(numTensors);
  });

  test("runs no window past the recording's last frame", async () => {
    expect.hasAssertions();

    const model = await readShippedModel();
    const execute = vi.spyOn(model, "execute");
    const { frames } = await readModel(model, tone);

    expect({ executions: execute.mock.calls.length, frames: frames.length }).toStrictEqual({
      executions: 1,
      frames: 140,
    });
  });
});
