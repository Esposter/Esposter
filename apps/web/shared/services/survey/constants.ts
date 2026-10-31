// A response keys each answer by its question's name, so the name is bounded where the response crosses the wire
export const MAX_SURVEY_QUESTION_NAME_LENGTH = 256;
// A response holds one answer per question, so this is the most questions a survey asks. The serialized bound beside
// It is what the Table holds, and this keeps the count a body could stretch from reaching it
export const MAX_SURVEY_QUESTION_COUNT = 1000;
