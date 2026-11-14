// The most characters a response's answers may serialize to. The one anonymous write path takes whatever a request body
// Carries, so the record is bounded here rather than by the store it is written to
export const MAX_SURVEY_ANSWERS_LENGTH = 32 * 1024;
