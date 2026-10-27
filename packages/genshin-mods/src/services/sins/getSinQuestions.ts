import { SIN_CRITERIA, SIN_NAMES, SinQuestionMap } from "./constants";

// The seven `score` questions one call answers, keyed by sin name, each graded on the same five levels
export const getSinQuestions = () =>
  Object.fromEntries(
    SIN_NAMES.map((name) => [name, { criteria: SIN_CRITERIA, instructions: SinQuestionMap[name], type: "score" }]),
  );
