import type { SurveyLogicFunction } from "#src/models/SurveyLogicFunction";

// The second value when the condition is truthy and the third otherwise. Fewer than two arguments read as null, which is
// What SurveyJS returns for them, not empty
export const iifFunction: SurveyLogicFunction = (args) => {
  if (args.length < 2) return null;

  const [condition, valueIfTrue, valueIfFalse] = args;
  return condition ? valueIfTrue : valueIfFalse;
};
