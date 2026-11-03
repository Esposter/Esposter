// The message a question with no answer shows when it is required, and the one an empty answer to a field shows
export const SURVEY_REQUIRED_MESSAGE = "Please answer this question.";
// The message a respondent sees for an answer of the wrong shape, which no more specific message covers
export const SURVEY_INVALID_ANSWER_MESSAGE = "This answer is not valid.";
// The message for a text answer shorter than its question allows
export const SURVEY_TOO_SHORT_MESSAGE = "This answer is too short.";
// The message for a text answer longer than its question allows
export const SURVEY_TOO_LONG_MESSAGE = "This answer is too long.";
// The message for a list of choices with fewer picked than its question requires
export const SURVEY_TOO_FEW_SELECTED_MESSAGE = "Select more choices.";
// The message for a list of choices with more picked than its question allows
export const SURVEY_TOO_MANY_SELECTED_MESSAGE = "Select fewer choices.";
// The message for a number outside the range its question gives
export const SURVEY_OUT_OF_RANGE_MESSAGE = "This answer is out of range.";
// The message for a value that is none of the choices its question offers
export const SURVEY_NOT_A_CHOICE_MESSAGE = "This answer is not one of the choices.";
// The message for a matrix or dynamic panel with fewer or more rows or panels than its question allows
export const SURVEY_WRONG_COUNT_MESSAGE = "This answer has the wrong number of rows or panels.";
// The value a none choice holds when a respondent picks it, the one answer that is not a choice's own value
export const SURVEY_NONE_ANSWER = "none";
