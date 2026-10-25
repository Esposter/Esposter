import { getDescendants } from "#src/services/sweeps/getDescendants";
import ts from "typescript";

export const getIdentifierNames = (node: ts.Node): string[] =>
  getDescendants(node)
    .filter((descendant) => ts.isIdentifier(descendant))
    .map((identifier) => identifier.text);
