import { characterizeMusicBands } from "#src/services/genshinParity/music/characterizeMusicBands";
import { LISTEN_BAND_CENTRES, LISTEN_SAMPLE_RATE } from "#src/services/genshinParity/shared/constants";
import { describe, expect, test } from "vitest";

describe(characterizeMusicBands, () => {
  // A held A4 over quiet white noise, two seconds of it
  const seconds = 2;
  const note = { duration: seconds, pitch: 69, start: 0, velocity: 1 };
  const samples = Float32Array.from({ length: seconds * LISTEN_SAMPLE_RATE }, (_, index) => {
    const hash = Math.sin(index * 12.9898) * 43_758.5453;
    return Math.sin((2 * Math.PI * 440 * index) / LISTEN_SAMPLE_RATE) + 0.01 * (2 * (hash - Math.floor(hash)) - 1);
  });

  test("reads the note's band as its partial and the bands it leaves as noise", () => {
    expect.hasAssertions();

    const bands = characterizeMusicBands(samples, LISTEN_SAMPLE_RATE, [note]);
    const noteBand = bands[LISTEN_BAND_CENTRES.indexOf(500)];
    const emptyBand = bands[LISTEN_BAND_CENTRES.indexOf(8000)];

    expect(noteBand?.partialShare).toBeCloseTo(1);
    expect(noteBand?.flatness).toBeLessThan(0.01);
    expect(emptyBand?.partialShare).toBeLessThan(0.5);
    expect(emptyBand?.flatness).toBeGreaterThan(0.3);
  });
});
