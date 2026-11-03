// A refusal of a survey's save: what is wrong, and the JSON pointer of the field at fault in the document
export interface SurveyDocumentIssue {
  message: string;
  pointer: string;
}
