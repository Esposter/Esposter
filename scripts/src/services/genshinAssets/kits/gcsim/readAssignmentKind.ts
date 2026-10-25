import type { GoToken } from "#src/models/genshinAssets/kits/gcsim/GoToken";

import { GoAssignmentKind } from "#src/models/genshinAssets/kits/gcsim/GoAssignmentKind";
import { GO_COMPOUND_ASSIGNMENT_OPERATORS } from "#src/services/genshinAssets/kits/constants";
import { checkIsGoPunctuation } from "#src/services/genshinAssets/kits/gcsim/checkIsGoPunctuation";

// The most tokens a compound assignment's operator and `=` are split into: `&^=` is three, where `<<=` is two
const COMPOUND_OPERATOR_TOKEN_COUNT = 3;

// Whether the name token at a position is set to a value by `:=` or `=`, or updated by `+=`, `<<=`, `++` and the like
export const readAssignmentKind = (tokens: readonly GoToken[], position: number): GoAssignmentKind | undefined => {
  const next = tokens[position + 1];
  if (checkIsGoPunctuation(next, ":=") || checkIsGoPunctuation(next, "=")) return GoAssignmentKind.Value;
  if (checkIsGoPunctuation(next, "++") || checkIsGoPunctuation(next, "--")) return GoAssignmentKind.Update;
  // The tokens spelled back together, so a split operator reads as the operator it is
  const spelling = tokens
    .slice(position + 1, position + 1 + COMPOUND_OPERATOR_TOKEN_COUNT)
    .map(({ text }) => text)
    .join("");
  return GO_COMPOUND_ASSIGNMENT_OPERATORS.some((operator) => spelling.startsWith(`${operator}=`))
    ? GoAssignmentKind.Update
    : undefined;
};
