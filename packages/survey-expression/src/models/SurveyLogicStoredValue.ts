// A value as the answers hold it in storage: a value of the model, with a null where storage may hold one. A null reads as
// Unanswered, so the value model never holds it
export type SurveyLogicStoredValue =
  | boolean
  | null
  | number
  | string
  | SurveyLogicStoredValue[]
  | undefined
  | { [name: string]: SurveyLogicStoredValue };
