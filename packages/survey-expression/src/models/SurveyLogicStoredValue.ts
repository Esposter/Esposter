// A value as the answers hold it in storage: a value of the model, with a null where storage may hold one. A null reads
// As Unanswered, so the value model never holds it
export type SurveyLogicStoredValue =
  | { [name: string]: SurveyLogicStoredValue }
  | boolean
  | null
  | number
  | string
  | SurveyLogicStoredValue[]
  | undefined;
