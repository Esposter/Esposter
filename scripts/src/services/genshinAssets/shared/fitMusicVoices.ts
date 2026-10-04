import type { InstrumentFit } from "#src/models/genshinAssets/shared/InstrumentFit";
import type { NoteEventTime } from "pitch-transcription/notes";

import { computeSpectrogram } from "#src/services/genshinAssets/shared/computeSpectrogram";
import { MUSIC_FRAME_LENGTH, MUSIC_HOP_LENGTH, MUSIC_VOICE_COUNT } from "#src/services/genshinAssets/shared/constants";
import { fitInstrument } from "#src/services/genshinAssets/shared/fitInstrument";
import { splitVoicesByRegister } from "#src/services/genshinAssets/shared/splitVoicesByRegister";
import { AUDIO_SAMPLE_RATE } from "pitch-transcription";

// A source's notes split by register into voices, and each voice's instrument fitted to the source it was heard in,
// Twice: a first fit counts every partial of every other note as covering what it overlaps, since nothing yet says how
// Loud any is; the second counts only those its voice's first fit expects loud enough to move a reading
export const fitMusicVoices = (
  samples: Float32Array,
  notes: NoteEventTime[],
): { splits: number[]; voiceFits: InstrumentFit[]; voiceNotesList: NoteEventTime[][] } => {
  const spectrogram = computeSpectrogram(samples, AUDIO_SAMPLE_RATE, MUSIC_FRAME_LENGTH, MUSIC_HOP_LENGTH);
  const splits = splitVoicesByRegister(
    notes.map(({ pitchMidi }) => pitchMidi),
    MUSIC_VOICE_COUNT,
  );
  const voiceNotesList = [-Infinity, ...splits].map((lowest, voice) =>
    notes.filter(({ pitchMidi }) => pitchMidi >= lowest && pitchMidi < (splits[voice] ?? Infinity)),
  );
  const noteInstrumentMap = new Map(
    voiceNotesList.flatMap((voiceNotes) => {
      const { instrument } = fitInstrument(spectrogram, voiceNotes, notes, () => Infinity);
      return voiceNotes.map((note) => [note, instrument] as const);
    }),
  );
  const readPartialAmplitude = (note: NoteEventTime, harmonic: number): number => {
    const instrument = noteInstrumentMap.get(note);
    return instrument ? note.amplitude * instrument.level * (instrument.harmonics[harmonic - 1] ?? 0) : Infinity;
  };
  const voiceFits = voiceNotesList.map((voiceNotes) =>
    fitInstrument(spectrogram, voiceNotes, notes, readPartialAmplitude),
  );
  return { splits, voiceFits, voiceNotesList };
};
