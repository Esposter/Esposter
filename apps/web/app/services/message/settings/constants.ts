import { MAX_INPUT_SENSITIVITY_DECIBELS, MIN_INPUT_SENSITIVITY_DECIBELS } from "@esposter/db-schema";

export const SETTINGS_CONTENT_ID = "settings-content";
// Number of vertical bars in the Discord-style input sensitivity level meter.
export const INPUT_LEVEL_METER_SEGMENT_COUNT = 30;
export const INPUT_SENSITIVITY_DECIBELS_RANGE = MAX_INPUT_SENSITIVITY_DECIBELS - MIN_INPUT_SENSITIVITY_DECIBELS;
