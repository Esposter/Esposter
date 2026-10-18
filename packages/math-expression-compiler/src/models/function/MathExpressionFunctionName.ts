// The function names the parser gives its postfix and signed operators. The parser builds nodes under them and the
// Function table keys its signatures by them, so each is written once here
export enum MathExpressionFunctionName {
  CTranspose = "ctranspose",
  Factorial = "factorial",
  UnaryMinus = "unaryMinus",
  UnaryPlus = "unaryPlus",
}
