import type { SurveyChoice } from "vue-survey-engine-headless";

// A choice typed or pasted as one line: a value, or a value and its text split by a bar, each side trimmed
export const parseChoiceLine = (line: string): SurveyChoice => {
  const separatorIndex = line.indexOf("|");
  if (separatorIndex === -1) return { text: "", value: line.trim() };

  return { text: line.slice(separatorIndex + 1).trim(), value: line.slice(0, separatorIndex).trim() };
};
