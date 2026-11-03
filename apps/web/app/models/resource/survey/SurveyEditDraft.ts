// A text typed into an expression field that its check refused. It is held beside the saved text it was typed over, and
// Shows only while that saved text is still the one saved
export interface SurveyEditDraft {
  base: string;
  fault?: string;
  text: string;
}
