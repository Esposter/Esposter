import { MIN_SPEECH_PEAK_DB } from "#src/services/constants";

// Whether a clip is loud enough to hear at its loudest, from its frame energies: a vocoder run that produced nothing is
// Refused, and the pause a sentence has is the one check of speech (`checkIsSpeech`) that asks for
export const checkIsAudible = (energiesDb: number[]): boolean => Math.max(...energiesDb) >= MIN_SPEECH_PEAK_DB;
