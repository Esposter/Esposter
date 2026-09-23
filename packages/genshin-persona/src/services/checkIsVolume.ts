import { MAX_VOLUME } from "#src/services/constants";

const WHOLE_NUMBER_REGEX = /^\d+$/u;
// A whole number of the volume scale, as the verb takes it and the file holds it
export const checkIsVolume = (value: string): boolean => WHOLE_NUMBER_REGEX.test(value) && Number(value) <= MAX_VOLUME;
