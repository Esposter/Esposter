import type { SurveyLogicFunction } from "#src/models/SurveyLogicFunction";

// The second value when the condition is truthy and the third otherwise. Fewer than two arguments read as nothing
export const iifFunction: SurveyLogicFunction = (args) => {
  if (args.length < 2) return undefined;

  const [condition, valueIfTrue, valueIfFalse] = args;
  return condition ? valueIfTrue : valueIfFalse;
};
