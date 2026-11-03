// How a response's answers are checked: a draft checks the answers it holds, and a submit also checks the questions it must have answered
export enum SurveyAnswerValidationMode {
  Draft = "draft",
  Submit = "submit",
}
