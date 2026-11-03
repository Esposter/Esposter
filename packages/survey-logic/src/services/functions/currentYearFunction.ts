import type { SurveyLogicFunction } from "#src/models/SurveyLogicFunction";

// The year of the clock
export const currentYearFunction: SurveyLogicFunction = (_args, context) => context.now.getFullYear();
