import type { NoteEventTime } from "pitch-transcription/notes";

// One source the login's music plays: its decoded samples, its segment and id, where its notes split into voices, each
// Voice's notes, and the release and tuning each voice's instrument was fitted to
export interface LoginMusicSource {
  samples: Float32Array;
  segmentId: number;
  sourceId: number;
  splits: number[];
  voiceNotesList: NoteEventTime[][];
  voiceReleases: number[];
  voiceTunings: number[];
}
