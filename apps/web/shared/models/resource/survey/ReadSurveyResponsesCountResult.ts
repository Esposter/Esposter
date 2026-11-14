// The count is capped, and isCapped says the true total is higher — only isCapped renders the "1000+" form
export interface ReadSurveyResponsesCountResult {
  count: number;
  isCapped: boolean;
}
