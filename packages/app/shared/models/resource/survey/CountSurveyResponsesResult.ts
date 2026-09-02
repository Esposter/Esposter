// Azure Table has no cheap server-side count, so the count is capped and isCapped says the true
// Total is higher — only isCapped renders the "1000+" form
export interface CountSurveyResponsesResult {
  count: number;
  isCapped: boolean;
}
