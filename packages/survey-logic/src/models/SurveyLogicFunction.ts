import type { SurveyLogicContext } from "#src/models/SurveyLogicContext";
import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

// A function an expression calls: it depends only on its arguments and the context's clock
export type SurveyLogicFunction = (args: SurveyLogicValue[], context: SurveyLogicContext) => SurveyLogicValue;
