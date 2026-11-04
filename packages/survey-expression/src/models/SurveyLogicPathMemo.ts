import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

// The names a call of a path read has read so far, each under the container it was read through
export type SurveyLogicPathMemo = Map<SurveyLogicValue, Map<string, SurveyLogicValue>>;
