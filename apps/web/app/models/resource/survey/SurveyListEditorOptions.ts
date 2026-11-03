// What a list editor checks each item of its list by: the key a row is told apart by, why an item is not valid on its
// Own, and the message a repeated key is refused with
export interface SurveyListEditorOptions<T> {
  duplicateMessage: string;
  getItemError: (item: T) => string | undefined;
  getKey: (item: T) => string;
}
