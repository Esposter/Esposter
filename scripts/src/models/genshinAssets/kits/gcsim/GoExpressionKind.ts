// The kinds of expression the Go reader parses: the literal forms and integer sums gcsim's action files write their
// Hitmarks and frames in, the calls and indexes around them, and anything else, kept as unknown
export enum GoExpressionKind {
  Binary = "Binary",
  Call = "Call",
  Composite = "Composite",
  Identifier = "Identifier",
  Index = "Index",
  Number = "Number",
  String = "String",
  Unary = "Unary",
  Unknown = "Unknown",
}
