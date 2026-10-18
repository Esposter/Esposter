import type { MathExpressionSignature } from "#src/models/function/MathExpressionSignature";

// The scalar forms a signature may carry, each optional, so a unary or a binary operator computes without an array
export type MathExpressionScalarCompute = Pick<MathExpressionSignature, "computeBinary" | "computeUnary">;
