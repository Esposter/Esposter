import type { ESTree } from "@oxlint/plugins";

export const checkIsStringLiteralType = (type: ESTree.TSType): boolean =>
  type.type === "TSLiteralType" && type.literal.type === "Literal" && typeof type.literal.value === "string";
