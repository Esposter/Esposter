// A row of a list an editor holds as a draft: its item, and an id that tells the row apart while it is moved or typed in
export interface SurveyListRow<T> {
  id: string;
  item: T;
}
