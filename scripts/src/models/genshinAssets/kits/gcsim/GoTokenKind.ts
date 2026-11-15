// The kinds of token the Go reader splits an action file into: what the constant evaluator and the attack reader read,
// And the line ends Go's grammar uses as statement ends
export const GoTokenKind = {
  Identifier: "Identifier",
  Newline: "Newline",
  Number: "Number",
  Punctuation: "Punctuation",
  String: "String",
} as const;
export type GoTokenKind = (typeof GoTokenKind)[keyof typeof GoTokenKind];
