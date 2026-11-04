// A value as the answers hold it in storage: a value of the model, with a null where storage may hold one. A null reads as
// Unanswered, so the value model never holds it
export type SurveyLogicStoredValue =
  | boolean
  | number
  | string
  | null
  | undefined
  | { [name: string]: SurveyLogicStoredValue }
  | SurveyLogicStoredValue[];
