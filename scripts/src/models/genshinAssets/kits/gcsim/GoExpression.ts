import type { GoExpressionKind } from "#src/models/genshinAssets/kits/gcsim/GoExpressionKind";

// A parsed Go expression. An identifier holds its whole qualified name, `attacks.AttackTagNormal`, and a composite
// Literal its elements with its type left out, as nested composites write them. A call holds the token each of its
// Parameters starts at beside the parameter's expression, so a reader finds each argument where it is written
export type GoExpression =
  | { callee: string; kind: typeof GoExpressionKind.Call; parameters: GoExpression[]; parameterStarts: number[] }
  | { elements: GoExpression[]; kind: typeof GoExpressionKind.Composite }
  | { index: GoExpression; kind: typeof GoExpressionKind.Index; target: GoExpression }
  | { isFloat: boolean; kind: typeof GoExpressionKind.Number; value: number }
  | { kind: typeof GoExpressionKind.Binary; left: GoExpression; operator: string; right: GoExpression }
  | { kind: typeof GoExpressionKind.Identifier; name: string }
  | { kind: typeof GoExpressionKind.String; value: string }
  | { kind: typeof GoExpressionKind.Unary; operand: GoExpression; operator: string }
  | { kind: typeof GoExpressionKind.Unknown };
