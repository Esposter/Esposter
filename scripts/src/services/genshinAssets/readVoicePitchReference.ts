import type { LaggedAgreement } from "#src/models/genshinParity/LaggedAgreement";
import type { SampledSolo } from "#src/models/genshinAssets/SampledSolo";
import type { NoteEventTime } from "pitch-transcription/notes";

import { SAMPLED_VOICE_MAX_LAG } from "#src/services/genshinAssets/constants";
import { computeChroma } from "#src/services/genshinParity/computeChroma";
import { readAudibleFrames } from "#src/services/genshinParity/readAudibleFrames";
import { readLaggedAgreement } from "#src/services/genshinParity/readLaggedAgreement";
import { readNoteChroma } from "#src/services/genshinParity/readNoteChroma";
import { renderFundamentals } from "#src/services/genshinParity/renderFundamentals";
import { AUDIO_SAMPLE_RATE } from "pitch-transcription";

// What a render of a voice's notes alone is scored against: the pitch classes the notes name with no instrument in
// Them, the frames they sound in, and a reader of a render's agreement with them. The same notes as pure tones at
// Their fundamentals come scored beside it: a sound with nothing in it but the notes' pitches, which a recorded
// Instrument that keeps the voice's pitch matches or passes
export const readVoicePitchReference = (
  voiceNotes: NoteEventTime[],
  release: number,
  tuning: number,
  length: number,
): { fundamentals: SampledSolo; readSolo: (rendered: Float32Array) => LaggedAgreement } => {
  const fundamentals = computeChroma(
    renderFundamentals(voiceNotes, release, tuning, AUDIO_SAMPLE_RATE, length),
    AUDIO_SAMPLE_RATE,
  );
  const noteChroma = readNoteChroma(voiceNotes, fundamentals.loudness.length, AUDIO_SAMPLE_RATE);
  const frames = readAudibleFrames(noteChroma.loudness);
  const readSolo = (rendered: Float32Array) =>
    readLaggedAgreement(
      computeChroma(rendered, AUDIO_SAMPLE_RATE).classes,
      noteChroma.classes,
      frames,
      SAMPLED_VOICE_MAX_LAG,
    );
  return {
    fundamentals: {
      ...readLaggedAgreement(fundamentals.classes, noteChroma.classes, frames, SAMPLED_VOICE_MAX_LAG),
      name: "Fundamentals",
      onset: 0,
      shift: 0,
    },
    readSolo,
  };
};
