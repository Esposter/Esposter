import { SURVEY_CALCULATED_VALUE_NAME } from "@/services/resource/survey/constants";

// The name a new calculated value starts with, numbered past each name an answer or a value already holds
export const getNewCalculatedValueName = (takenNames: readonly string[]): string => {
  const names = new Set(takenNames);
  let name = SURVEY_CALCULATED_VALUE_NAME;
  let number = 1;
  while (names.has(name)) {
    number++;
    name = `${SURVEY_CALCULATED_VALUE_NAME}${number}`;
  }

  return name;
};
