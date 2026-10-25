import { MIDI_TICKS_PER_SECOND } from "#src/services/writeMidi/constants";

export const toTicks = (seconds: number) => Math.round(seconds * MIDI_TICKS_PER_SECOND);
