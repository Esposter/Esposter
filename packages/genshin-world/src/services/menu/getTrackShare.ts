import type { SettingRange } from "#src/models/menu/SettingRange";

// The share of its track a value stands at, which places a slider's knob along the line
export const getTrackShare = (value: number, range: SettingRange): number =>
  (value - range.min) / (range.max - range.min);
