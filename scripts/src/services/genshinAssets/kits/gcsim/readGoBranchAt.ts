import type { GcsimAttackBranch } from "#src/models/genshinAssets/kits/gcsim/GcsimAttackBranch";
import type { GoToken } from "#src/models/genshinAssets/kits/gcsim/GoToken";

import { GoTokenKind } from "#src/models/genshinAssets/kits/gcsim/GoTokenKind";
import { checkIsGoPunctuation } from "#src/services/genshinAssets/kits/gcsim/checkIsGoPunctuation";

interface GoBranchPlace {
  chain: number;
  index: number;
}

interface GoBranchBody extends GoBranchPlace {
  closePosition: number;
  openPosition: number;
}

// The `if` a brace's statement opens, scanning back over its tokens to the line or block it starts in, else undefined.
// A function literal's or a struct's brace has no `if` in its statement
const findStatementIf = (tokens: readonly GoToken[], openPosition: number): number | undefined => {
  for (let position = openPosition - 1; position >= 0; position--) {
    const token = tokens[position];
    if (
      token === undefined ||
      token.kind === GoTokenKind.Newline ||
      checkIsGoPunctuation(token, "{") ||
      checkIsGoPunctuation(token, "}") ||
      checkIsGoPunctuation(token, ";")
    )
      return undefined;
    if (token.text === "if") return position;
  }
  return undefined;
};

// Reads the if and else bodies of a Go file as chains. An `if` opens a chain, and an `else` or `else if` whose brace
// Follows the previous body's close continues it. Returns the branch a position sits in, innermost first, with the
// Line the chain's last body closes on
export const readGoBranchAt = (tokens: readonly GoToken[]): ((position: number) => GcsimAttackBranch | undefined) => {
  const bodies: GoBranchBody[] = [];
  const chainEndLineMap = new Map<number, number>();
  const openings: { branch: GoBranchPlace | undefined; openPosition: number }[] = [];
  let chainCount = 0;
  let pending: GoBranchPlace | undefined;
  const openBrace = (position: number) => {
    const ifPosition = findStatementIf(tokens, position);
    const isElse =
      tokens[position - 1]?.text === "else" || (ifPosition !== undefined && tokens[ifPosition - 1]?.text === "else");
    let branch: GoBranchPlace | undefined;
    if (isElse) branch = pending === undefined ? undefined : { ...pending, index: pending.index + 1 };
    else if (ifPosition !== undefined) branch = { chain: chainCount++, index: 0 };
    openings.push({ branch, openPosition: position });
    pending = undefined;
  };
  const closeBrace = (position: number, line: number) => {
    const opening = openings.pop();
    if (opening?.branch === undefined) {
      pending = undefined;
      return;
    }
    chainEndLineMap.set(opening.branch.chain, line);
    bodies.push({ ...opening.branch, closePosition: position, openPosition: opening.openPosition });
    pending = tokens[position + 1]?.text === "else" ? opening.branch : undefined;
  };
  for (const [position, token] of tokens.entries()) {
    const isOpen = checkIsGoPunctuation(token, "{");
    if (isOpen) openBrace(position);
    else if (checkIsGoPunctuation(token, "}")) closeBrace(position, token.line);
  }
  return (position) => {
    let innermost: GoBranchBody | undefined;
    for (const body of bodies)
      if (
        body.openPosition < position &&
        position < body.closePosition &&
        (innermost === undefined || body.openPosition > innermost.openPosition)
      )
        innermost = body;
    return innermost === undefined
      ? undefined
      : { chain: innermost.chain, endLine: chainEndLineMap.get(innermost.chain) ?? 0, index: innermost.index };
  };
};
