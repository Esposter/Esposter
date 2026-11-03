import type { SurveyLogicRecord } from "#src/models/SurveyLogicRecord";

// The values an expression reads and computes. Undefined is an empty answer, a question nobody has answered
export type SurveyLogicValue = boolean | number | string | null | undefined | SurveyLogicRecord | SurveyLogicValue[];
