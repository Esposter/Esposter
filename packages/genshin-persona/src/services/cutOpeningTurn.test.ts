import { MIN_TURN_PAUSE_SECONDS, VOICE_SAMPLE_RATE } from "#src/services/constants";
import { cutOpeningTurn } from "#src/services/cutOpeningTurn";
import { describe, expect, test } from "vitest";

const getTone = (length: number) => Float32Array.from({ length }, (_, index) => Math.sin(index));

describe(cutOpeningTurn, () => {
  const TURN_SECONDS = 1;
  const turnSamples = TURN_SECONDS * VOICE_SAMPLE_RATE;
  // Twice the least pause, since a frame straddling a turn's edge is still loud
  const pauseSamples = 2 * MIN_TURN_PAUSE_SECONDS * VOICE_SAMPLE_RATE;

  test("keeps the clip up to the first pause long enough to be the other speaker's cue", () => {
    expect.hasAssertions();

    const samples = new Float32Array(turnSamples * 2 + pauseSamples);
    samples.set(getTone(turnSamples), 0);
    samples.set(getTone(turnSamples), turnSamples + pauseSamples);

    const { samples: openingTurn } = cutOpeningTurn({ sampleRate: VOICE_SAMPLE_RATE, samples });

    expect(openingTurn.length).toBeGreaterThanOrEqual(turnSamples * 0.9);
    expect(openingTurn.length).toBeLessThanOrEqual(turnSamples * 1.1);
  });

  test("keeps a clip with no such pause whole", () => {
    expect.hasAssertions();

    const samples = getTone(turnSamples);

    expect(cutOpeningTurn({ sampleRate: VOICE_SAMPLE_RATE, samples }).samples).toBe(samples);
  });
});
