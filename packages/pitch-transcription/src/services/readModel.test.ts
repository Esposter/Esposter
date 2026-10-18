import type { ModelReadings } from "#src/models/ModelReadings";

import { AUDIO_SAMPLE_RATE, MODEL_URL } from "#src/constants";
import { createNotes } from "#src/services/createNotes";
import { readModel } from "#src/services/readModel";
import { InferenceSession, Tensor } from "onnxruntime-node";
import { fileURLToPath } from "node:url";
import { beforeAll, describe, expect, test, vi } from "vitest";

const readShippedSession = (): Promise<InferenceSession> => InferenceSession.create(fileURLToPath(MODEL_URL));

describe(readModel, () => {
  // A tone at A4 whose frames the model's first window covers, though its samples run into a second window
  const tone = Float32Array.from(
    { length: 36000 },
    (_value, index) => Math.sin((2 * Math.PI * 440 * index) / AUDIO_SAMPLE_RATE) / 2,
  );
  // Two tones one after the other, A4 then E5, so the model hears two notes the snapshot can tell apart
  const twoTones = Float32Array.from(
    { length: 36000 },
    (_value, index) => Math.sin((2 * Math.PI * (index < 18000 ? 440 : 659) * index) / AUDIO_SAMPLE_RATE) / 2,
  );
  // One read of the shipped model, which every test below observes a part of: a read takes a few seconds alone and
  // Several times that under coverage, so a read per test cannot fit the default test timeout
  let disposals = 0;
  let executions = 0;
  let readings: ModelReadings;
  let twoTonesReadings: ModelReadings;

  beforeAll(async () => {
    const session = await readShippedSession();
    const run = vi.spyOn(session, "run");
    const dispose = vi.spyOn(Tensor.prototype, "dispose");
    readings = await readModel(session, tone);
    disposals = dispose.mock.calls.length;
    executions = run.mock.calls.length;
    twoTonesReadings = await readModel(session, twoTones);
    vi.restoreAllMocks();
  });

  test("hears a tone's pitch", () => {
    expect.hasAssertions();

    expect(new Set(createNotes(readings).map(({ pitchMidi }) => pitchMidi))).toStrictEqual(new Set([69]));
  });

  test("disposes every output it reads", () => {
    expect.hasAssertions();

    expect({ disposals, outputs: executions * 3 }).toStrictEqual({ disposals: 3, outputs: 3 });
  });

  test("runs no window past the recording's last frame", () => {
    expect.hasAssertions();

    expect({ executions, frames: readings.frames.length }).toStrictEqual({ executions: 1, frames: 140 });
  });

  test("hears the notes the TensorFlow.js export heard", () => {
    expect.hasAssertions();

    expect(
      createNotes(twoTonesReadings).map(({ durationFrames, pitchMidi, startFrame }) => ({
        durationFrames,
        pitchMidi,
        startFrame,
      })),
    ).toMatchInlineSnapshot(`
      [
        {
          "durationFrames": 66,
          "pitchMidi": 69,
          "startFrame": 1,
        },
        {
          "durationFrames": 70,
          "pitchMidi": 76,
          "startFrame": 68,
        },
      ]
    `);
  });
});
