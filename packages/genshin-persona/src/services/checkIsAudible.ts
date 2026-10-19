import { MIN_SPEECH_PEAK_DB } from "#src/services/constants";

// Whether a clip is loud enough to hear at its loudest, with no pause required. A chunk of a sentence is a stretch
// Of speech that can run on without a pause, so only a vocoder run that produced nothing is refused
export const checkIsAudible = (energiesDb: number[]): boolean => Math.max(...energiesDb) >= MIN_SPEECH_PEAK_DB;
