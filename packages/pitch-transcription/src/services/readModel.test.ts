import type { ModelReadings } from "#src/models/ModelReadings";
import type { GraphModel, io } from "@tensorflow/tfjs";

import { AUDIO_SAMPLE_RATE, MODEL_URL, MODEL_WEIGHTS_URL } from "#src/constants";
import { createNotes } from "#src/services/createNotes";
import { readModel } from "#src/services/readModel";
import { loadGraphModelSync, memory } from "@tensorflow/tfjs";
import { readFile } from "node:fs/promises";
import { beforeAll, describe, expect, test, vi } from "vitest";

const readShippedModel = async (): Promise<GraphModel<io.IOHandlerSync>> => {
  const [modelJson, weights] = await Promise.all([readFile(MODEL_URL, "utf8"), readFile(MODEL_WEIGHTS_URL)]);
  // oxlint-disable-next-line no-restricted-properties -- the model's topology and weight manifest, which hold no dates
  return loadGraphModelSync([JSON.parse(modelJson), new Uint8Array(weights).buffer]);
};

describe(readModel, () => {
  // A tone at A4 whose frames the model's first window covers, though its samples run into a second window
  const tone = Float32Array.from(
    { length: 36000 },
    (_, index) => Math.sin((2 * Math.PI * 440 * index) / AUDIO_SAMPLE_RATE) / 2,
  );
  // One read of the shipped model, which every test below observes a part of: a read takes a few seconds alone and
  // Several times that under coverage, so a read per test cannot fit the default test timeout
  let executions = 0;
  let readings: ModelReadings;
  let tensorCounts: { after: number; before: number };

  beforeAll(async () => {
    const model = await readShippedModel();
    const execute = vi.spyOn(model, "execute");
    const before = memory().numTensors;
    readings = await readModel(model, tone);
    tensorCounts = { after: memory().numTensors, before };
    executions = execute.mock.calls.length;
  });

  test("hears a tone's pitch", () => {
    expect.hasAssertions();

    expect(new Set(createNotes(readings).map(({ pitchMidi }) => pitchMidi))).toStrictEqual(new Set([69]));
  });

  test("frees every tensor it makes", () => {
    expect.hasAssertions();

    expect(tensorCounts.after).toBe(tensorCounts.before);
  });

  test("runs no window past the recording's last frame", () => {
    expect.hasAssertions();

    expect({ executions, frames: readings.frames.length }).toStrictEqual({ executions: 1, frames: 140 });
  });
});
