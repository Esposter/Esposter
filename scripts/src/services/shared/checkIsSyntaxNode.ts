import type { Node } from "oxc-parser";

export const checkIsSyntaxNode = (value: unknown): value is Node =>
  typeof value === "object" && value !== null && "type" in value && "start" in value;
