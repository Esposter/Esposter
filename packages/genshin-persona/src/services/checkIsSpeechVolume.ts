import { MAX_SPEECH_VOLUME, SPEECH_VOLUME_LEVELS } from "#src/services/constants";

const WHOLE_NUMBER_REGEX = /^\d+$/u;

// A level the speech markup names, or a whole number of the scale it also takes
export const checkIsSpeechVolume = (value: string): boolean =>
  SPEECH_VOLUME_LEVELS.includes(value) || (WHOLE_NUMBER_REGEX.test(value) && Number(value) <= MAX_SPEECH_VOLUME);
