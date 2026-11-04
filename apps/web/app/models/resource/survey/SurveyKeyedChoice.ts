// A choice of a list held under its key, the place it holds in its question, which a list keys its rows by
export interface SurveyKeyedChoice<TChoice> {
  choice: TChoice;
  key: string;
}
