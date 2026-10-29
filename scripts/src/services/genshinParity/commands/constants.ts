import { PARITY_SHARED_DIRECTORY } from "#src/services/genshinParity/shared/constants";
import { join } from "node:path";

// A session long enough for a handful of screens and their motion, and short enough to sample quickly
export const RECORD_DEFAULT_SECONDS: number = Temporal.Duration.from({ minutes: 2 }).total("seconds");

// The map naming every reference, whose held cameras `pose --write` rewrites
export const PARITY_REFERENCE_MAP_PATH: string = join(PARITY_SHARED_DIRECTORY, "ParityReferenceMap.ts");
export const NOTE_SUPPORT_MIN_DECIBELS = 0;
export const NOTE_SUPPORT_FOLDS = 6;
