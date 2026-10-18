// A formula the parser refuses, with mathjs's words for the refusal as its message
export class MathExpressionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MathExpressionError";
  }
}
