import type { SampledSolo } from "#src/models/genshinAssets/music/SampledSolo";
import type { LaggedAgreement } from "#src/models/genshinParity/music/LaggedAgreement";
import type { NoteEventTime } from "pitch-transcription/notes";

import { SAMPLED_VOICE_MAX_LAG } from "#src/services/genshinAssets/shared/constants";
import { computeAudibleFrames } from "#src/services/genshinParity/music/computeAudibleFrames";
import { computeChroma } from "#src/services/genshinParity/music/computeChroma";
import { computeLaggedAgreement } from "#src/services/genshinParity/music/computeLaggedAgreement";
import { computeNoteChroma } from "#src/services/genshinParity/music/computeNoteChroma";
import { renderFundamentals } from "#src/services/genshinParity/music/renderFundamentals";
import { AUDIO_SAMPLE_RATE } from "pitch-transcription";

// What a render of a voice's notes alone is scored against: the pitch classes the notes name with no instrument in
// Them, the frames they sound in, and a reader of a render's agreement with them. The same notes as pure tones at
// Their fundamentals come scored beside it: a sound with nothing in it but the notes' pitches, which a recorded
// Instrument that keeps the voice's pitch matches or passes
export const computeVoicePitchReference = (
  voiceNotes: NoteEventTime[],
  release: number,
  tuning: number,
  length: number,
): { computeSolo: (rendered: Float32Array) => LaggedAgreement; fundamentals: SampledSolo } => {
  const fundamentals = computeChroma(
    renderFundamentals(voiceNotes, release, tuning, AUDIO_SAMPLE_RATE, length),
    AUDIO_SAMPLE_RATE,
  );
  const noteChroma = computeNoteChroma(voiceNotes, fundamentals.loudness.length, AUDIO_SAMPLE_RATE);
  const frames = computeAudibleFrames(noteChroma.loudness);
  const computeSolo = (rendered: Float32Array) =>
    computeLaggedAgreement(
      computeChroma(rendered, AUDIO_SAMPLE_RATE).classes,
      noteChroma.classes,
      frames,
      SAMPLED_VOICE_MAX_LAG,
    );
  return {
    computeSolo,
    fundamentals: {
      ...computeLaggedAgreement(fundamentals.classes, noteChroma.classes, frames, SAMPLED_VOICE_MAX_LAG),
      name: "Fundamentals",
      onset: 0,
      shift: 0,
    },
  };
};
