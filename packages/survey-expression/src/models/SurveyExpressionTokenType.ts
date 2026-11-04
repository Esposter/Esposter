// The kinds of token the tokenizer reads. A keyword that spells an operator is an operator, never a name, so `and` is
// Never read as the name of a call
export enum SurveyExpressionTokenType {
  Boolean = "boolean",
  End = "end",
  Identifier = "identifier",
  Number = "number",
  Operator = "operator",
  Punctuation = "punctuation",
  Reference = "reference",
  String = "string",
}
