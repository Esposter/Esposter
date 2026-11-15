// The kinds of input an item of a multiple text question takes, a narrower list than a text question's, so it is its own enum
export const SurveyMultipleTextItemInputType = { Email: "email", Number: "number", Text: "text" } as const;
export type SurveyMultipleTextItemInputType =
  (typeof SurveyMultipleTextItemInputType)[keyof typeof SurveyMultipleTextItemInputType];
