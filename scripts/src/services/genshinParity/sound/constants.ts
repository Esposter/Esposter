// A sound effect is scored every 5 milliseconds at 48 kHz, finer than its fit's frames, over the cells within 40 decibels
// Of the game's loudest
export const SOUND_SCORE_HOP_LENGTH = 240;
export const SOUND_SCORE_RANGE_DECIBELS = 40;
// The power a sound's level is read from when it is silent: the smallest positive float, so a silent cell reads as the
// Least decibels a float holds rather than minus infinity
export const SOUND_POWER_FLOOR: number = Number.MIN_VALUE;
