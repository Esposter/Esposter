// The fault an expression is refused for, at the character index of the token it starts at
export interface SurveyLogicError {
  message: string;
  position: number;
}
