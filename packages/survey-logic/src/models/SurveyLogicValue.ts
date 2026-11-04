import type { SurveyLogicRecord } from "#src/models/SurveyLogicRecord";

// The values an expression reads and computes.
// Undefined is the one absent value: an unanswered question, an empty result or an operation that has no result
export type SurveyLogicValue = boolean | number | string | undefined | SurveyLogicRecord | SurveyLogicValue[];
