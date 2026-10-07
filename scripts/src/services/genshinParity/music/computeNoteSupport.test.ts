import type { Spectrogram } from "#src/models/genshinAssets/shared/Spectrogram";
import type { MusicNote } from "genshin-engine";

import { computeNoteSupport } from "#src/services/genshinParity/music/computeNoteSupport";
import {
  LISTEN_SAMPLE_RATE,
  NOTE_SUPPORT_FRAME_LENGTH,
  NOTE_SUPPORT_HOP_LENGTH,
} from "#src/services/genshinParity/shared/constants";
import { describe, expect, test } from "vitest";

describe(computeNoteSupport, () => {
  const binCount = NOTE_SUPPORT_FRAME_LENGTH / 2;
  const frameCount = 16;
  const note: MusicNote = { duration: 1, pitch: 69, start: 0, velocity: 1 };
  // Every frame flat at one magnitude, with the bins about A4 at another
  const createSpectrogram = (floor: number, pitchMagnitude: number): Spectrogram => {
    const magnitudes = new Float32Array(frameCount * binCount).fill(floor);
    const pitchBin = Math.round(440 / (LISTEN_SAMPLE_RATE / NOTE_SUPPORT_FRAME_LENGTH));
    for (let frame = 0; frame < frameCount; frame++) magnitudes[frame * binCount + pitchBin] = pitchMagnitude;
    return {
      binCount,
      frameCount,
      frameLength: NOTE_SUPPORT_FRAME_LENGTH,
      hopLength: NOTE_SUPPORT_HOP_LENGTH,
      magnitudes,
      sampleRate: LISTEN_SAMPLE_RATE,
    };
  };

  test("reads how far the game stands over ours at the note's fundamental", () => {
    expect.hasAssertions();

    expect(computeNoteSupport(createSpectrogram(1, 10), createSpectrogram(1, 1), note)).toBeCloseTo(20);
  });

  test("reads nothing for a note no frame centres on", () => {
    expect.hasAssertions();

    expect(
      computeNoteSupport(createSpectrogram(1, 10), createSpectrogram(1, 1), { ...note, start: 2 }),
    ).toBeUndefined();
  });
});
