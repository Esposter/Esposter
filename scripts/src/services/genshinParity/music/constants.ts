import { PARITY_SHARED_DIRECTORY } from "#src/services/genshinParity/shared/constants";
import { join } from "node:path";

export const CHROMA_MIN_FREQUENCY = 60;
export const CHROMA_MAX_FREQUENCY = 2500;
export const LISTEN_FLOOR_DECIBELS = 60;

// The energy a music band's level is read from, zero: an exact silence is minus infinity, which the game's floor clamps
export const MUSIC_ENERGY_FLOOR = 0;

// A frame whose whole power rises by half again over the last is a note's attack, where `bands` weighs a band's power
export const BANDS_ONSET_RISE = 1.5;
export const NOTE_SUPPORT_SEMITONES = 0.3;
export const NOTE_SUPPORT_DELAY_SECONDS = 0.04;
export const NOTE_SUPPORT_SPAN_SECONDS = 0.6;

// The committed report of each music segment's last `listen`
export const PARITY_MUSIC_SCORES_PATH: string = join(PARITY_SHARED_DIRECTORY, "ParityMusicScores.snapshot.md");
