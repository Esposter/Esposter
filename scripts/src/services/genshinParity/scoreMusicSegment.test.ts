import { LISTEN_BAND_CENTRES, LISTEN_SAMPLE_RATE } from "#src/services/genshinParity/constants";
import { scoreMusicSegment } from "#src/services/genshinParity/scoreMusicSegment";
import { describe, expect, test } from "vitest";

describe(scoreMusicSegment, () => {
  // A chord across every band: A in each octave from the lowest band's to the highest's
  const chord = Float32Array.from({ length: 2 * LISTEN_SAMPLE_RATE }, (_, index) =>
    LISTEN_BAND_CENTRES.reduce(
      (sum, _centre, octave) => sum + Math.sin((2 * Math.PI * 55 * 2 ** octave * index) / LISTEN_SAMPLE_RATE) / 16,
      0,
    ),
  );

  test("scores a render identical to the game's as agreeing wholly, no band apart", () => {
    expect.hasAssertions();

    const { distance, pitchAgreement } = scoreMusicSegment(chord, chord, LISTEN_SAMPLE_RATE);

    expect(pitchAgreement).toBeCloseTo(1);
    expect(distance).toBeCloseTo(0);
  });

  test("charges a render twice as loud six decibels in every band", () => {
    expect.hasAssertions();

    const louder = chord.map((sample) => sample * 2);
    const { bandDistances, pitchAgreement } = scoreMusicSegment(louder, chord, LISTEN_SAMPLE_RATE);

    expect(pitchAgreement).toBeCloseTo(1);
    expect(bandDistances.map((distance) => Number(distance.toFixed(1)))).toStrictEqual(
      LISTEN_BAND_CENTRES.map(() => 6),
    );
  });
});
