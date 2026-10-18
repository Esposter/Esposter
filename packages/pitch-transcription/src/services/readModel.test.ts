import { AUDIO_SAMPLE_RATE, MODEL_URL } from "#src/constants";
import { createNotes } from "#src/services/createNotes";
import { readModel } from "#src/services/readModel";
import { fileURLToPath } from "node:url";
import { InferenceSession, Tensor } from "onnxruntime-node";
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from "vitest";

describe(readModel, () => {
  let session: InferenceSession;

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

  beforeAll(async () => {
    session = await InferenceSession.create(fileURLToPath(MODEL_URL));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  afterAll(async () => {
    await session.release();
  });

  test("disposes every output it reads", async () => {
    expect.hasAssertions();

    const run = vi.spyOn(session, "run");
    const dispose = vi.spyOn(Tensor.prototype, "dispose");
    await readModel(session, tone);

    expect(dispose).toHaveBeenCalledTimes(run.mock.calls.length * 3);
  });

  test("runs no window past the recording's last frame", async () => {
    expect.hasAssertions();

    const run = vi.spyOn(session, "run");
    const readings = await readModel(session, tone);

    expect({ executions: run.mock.calls.length, frames: readings.frames.length }).toStrictEqual({
      executions: 1,
      frames: 140,
    });
  });

  test("hears the notes the TensorFlow.js export heard", async () => {
    expect.hasAssertions();

    const readings = await readModel(session, twoTones);

    expect(
      createNotes(readings).map(({ durationFrames, pitchMidi, startFrame }) => ({
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

  test("reads a note across the seam between two windows", async () => {
    expect.hasAssertions();

    const seamTone = Float32Array.from(
      { length: 60000 },
      (_value, index) => Math.sin((2 * Math.PI * 440 * index) / AUDIO_SAMPLE_RATE) / 2,
    );
    const run = vi.spyOn(session, "run");
    const readings = await readModel(session, seamTone);

    expect({
      executions: run.mock.calls.length,
      notes: createNotes(readings).map(({ durationFrames, pitchMidi, startFrame }) => ({
        durationFrames,
        pitchMidi,
        startFrame,
      })),
    }).toMatchInlineSnapshot(`
      {
        "executions": 2,
        "notes": [
          {
            "durationFrames": 231,
            "pitchMidi": 69,
            "startFrame": 2,
          },
        ],
      }
    `);
  });
});
