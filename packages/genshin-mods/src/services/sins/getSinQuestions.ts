import { SinNames } from "../../models/SinName";
import { SIN_CRITERIA } from "./constants";
import { SinQuestionMap } from "./SinQuestionMap";

// The seven `score` questions one call answers, keyed by sin name, each graded on the same five levels
export const getSinQuestions = (): Record<
  string,
  { criteria: typeof SIN_CRITERIA; instructions: string; type: "score" }
> =>
  Object.fromEntries(
    SinNames.map((name) => [name, { criteria: SIN_CRITERIA, instructions: SinQuestionMap[name], type: "score" }]),
  );
