// The kinds of token the Go reader splits an action file into: what the constant evaluator and the attack reader read,
// And the line ends Go's grammar uses as statement ends
export enum GoTokenKind {
  Identifier = "Identifier",
  Newline = "Newline",
  Number = "Number",
  Punctuation = "Punctuation",
  String = "String",
}
