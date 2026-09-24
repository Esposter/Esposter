import { INPUT_SENSITIVITY_DECIBELS_RANGE } from "@/services/message/settings/constants";
import { MIN_INPUT_SENSITIVITY_DECIBELS } from "@esposter/db-schema";

// How far along the sensitivity scale a level sits, from 0 at its floor to 1 at its ceiling
export const getInputSensitivityFraction = (decibels: number) =>
  (decibels - MIN_INPUT_SENSITIVITY_DECIBELS) / INPUT_SENSITIVITY_DECIBELS_RANGE;
