import type { SyntaxNode } from "#src/models/syntax/SyntaxNode";

export const checkIsSyntaxNode = (value: unknown): value is SyntaxNode =>
  typeof value === "object" && value !== null && "type" in value && "start" in value;
