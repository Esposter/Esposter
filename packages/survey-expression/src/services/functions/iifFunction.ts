import type { SurveyLogicFunction } from "#src/models/SurveyLogicFunction";

// The second value when the condition is `true` and the third otherwise. Fewer than two arguments read as nothing (R8)
export const iifFunction: SurveyLogicFunction = (args) => {
  if (args.length < 2) return undefined;

  const [condition, valueIfTrue, valueIfFalse] = args;
  return condition === true ? valueIfTrue : valueIfFalse;
};
