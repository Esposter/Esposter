import type { GoExpressionKind } from "#src/models/genshinAssets/kits/gcsim/GoExpressionKind";

// A parsed Go expression. An identifier holds its whole qualified name, `attacks.AttackTagNormal`, and a composite
// Literal its elements with its type left out, as nested composites write them. A call holds the token each of its
// Parameters starts at beside the parameter's expression, so a reader finds each argument where it is written
export type GoExpression =
  | { callee: string; kind: GoExpressionKind.Call; parameterStarts: number[]; parameters: GoExpression[] }
  | { elements: GoExpression[]; kind: GoExpressionKind.Composite }
  | { index: GoExpression; kind: GoExpressionKind.Index; target: GoExpression }
  | { isFloat: boolean; kind: GoExpressionKind.Number; value: number }
  | { kind: GoExpressionKind.Binary; left: GoExpression; operator: string; right: GoExpression }
  | { kind: GoExpressionKind.Identifier; name: string }
  | { kind: GoExpressionKind.String; value: string }
  | { kind: GoExpressionKind.Unary; operand: GoExpression; operator: string }
  | { kind: GoExpressionKind.Unknown };
