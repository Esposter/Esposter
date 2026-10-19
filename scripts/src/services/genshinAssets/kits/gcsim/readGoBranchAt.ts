import type { GcsimAttackBranch } from "#src/models/genshinAssets/kits/gcsim/GcsimAttackBranch";
import type { GoToken } from "#src/models/genshinAssets/kits/gcsim/GoToken";

import { GoTokenKind } from "#src/models/genshinAssets/kits/gcsim/GoTokenKind";
import { checkIsGoPunctuation } from "#src/services/genshinAssets/kits/gcsim/checkIsGoPunctuation";

interface GoBranchBody extends GoOpenBody {
  closePosition: number;
}

interface GoBranchOpening {
  branch: GoBranchPlace | undefined;
  openPosition: number;
  switchFrame: GoSwitchFrame | undefined;
}

interface GoBranchPlace {
  chain: number;
  index: number;
}

interface GoOpenBody extends GoBranchPlace {
  openPosition: number;
}

// The clauses a switch has opened so far: its chain, how many clauses have started, and the clause the cursor is in
interface GoSwitchFrame {
  chain: number;
  clause: GoOpenBody | undefined;
  clauseCount: number;
}

// The keyword a brace's statement opens with, such as `if` or `switch`, scanning back over its tokens to the line or block
// It starts in, else undefined. A function literal's or a struct's brace has no such keyword in its statement, and a switch
// With an init statement, `switch x := f(); x {`, is not read since the scan stops at its `;`
const findStatementKeyword = (
  tokens: readonly GoToken[],
  openPosition: number,
  keyword: string,
): number | undefined => {
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
    if (token.text === keyword) return position;
  }
  return undefined;
};

// Whether a token starts a clause of a switch, a `case` or a `default`
const checkIsSwitchClause = (token: GoToken): boolean =>
  token.kind === GoTokenKind.Identifier && (token.text === "case" || token.text === "default");

// Reads the if and else bodies and the switch clauses of a Go file as chains. An `if` opens a chain, and an `else` or
// `else if` whose brace follows the previous body's close continues it. A `switch` opens a chain too, its clauses its
// Bodies numbered from zero in the order they are written, each running to the next clause or the switch's brace.
// Returns the branch a position sits in, innermost first, with the line the chain's last body closes on, its arm count and
// Whether one of its arms always runs
export const readGoBranchAt = (tokens: readonly GoToken[]): ((position: number) => GcsimAttackBranch | undefined) => {
  const bodies: GoBranchBody[] = [];
  const chainEndLineMap = new Map<number, number>();
  const exhaustiveChains = new Set<number>();
  const openings: GoBranchOpening[] = [];
  let chainCount = 0;
  let pending: GoBranchPlace | undefined;
  const closeClause = (frame: GoSwitchFrame, position: number) => {
    if (frame.clause === undefined) return;
    bodies.push({ ...frame.clause, chain: frame.chain, closePosition: position });
    frame.clause = undefined;
  };
  // A clause belongs to the innermost open brace, so a case inside a nested function literal or an if is no clause of a switch
  const openClause = (position: number) => {
    const frame = openings.at(-1)?.switchFrame;
    if (frame === undefined) return;
    closeClause(frame, position);
    if (tokens[position]?.text === "default") exhaustiveChains.add(frame.chain);
    frame.clause = { chain: frame.chain, index: frame.clauseCount++, openPosition: position };
  };
  const openBrace = (position: number) => {
    if (findStatementKeyword(tokens, position, "switch") !== undefined) {
      openings.push({
        branch: undefined,
        openPosition: position,
        switchFrame: { chain: chainCount++, clause: undefined, clauseCount: 0 },
      });
      pending = undefined;
      return;
    }
    const ifPosition = findStatementKeyword(tokens, position, "if");
    const isElse =
      tokens[position - 1]?.text === "else" || (ifPosition !== undefined && tokens[ifPosition - 1]?.text === "else");
    let branch: GoBranchPlace | undefined;
    if (isElse) branch = pending === undefined ? undefined : { ...pending, index: pending.index + 1 };
    else if (ifPosition !== undefined) branch = { chain: chainCount++, index: 0 };
    if (branch !== undefined && isElse && ifPosition === undefined) exhaustiveChains.add(branch.chain);
    openings.push({ branch, openPosition: position, switchFrame: undefined });
    pending = undefined;
  };
  const closeBrace = (position: number, line: number) => {
    const opening = openings.pop();
    if (opening?.switchFrame !== undefined) {
      closeClause(opening.switchFrame, position);
      chainEndLineMap.set(opening.switchFrame.chain, line);
      pending = undefined;
      return;
    }
    if (opening?.branch === undefined) {
      pending = undefined;
      return;
    }
    chainEndLineMap.set(opening.branch.chain, line);
    bodies.push({ ...opening.branch, closePosition: position, openPosition: opening.openPosition });
    pending = tokens[position + 1]?.text === "else" ? opening.branch : undefined;
  };
  for (const [position, token] of tokens.entries())
    if (checkIsGoPunctuation(token, "{")) openBrace(position);
    else if (checkIsGoPunctuation(token, "}")) closeBrace(position, token.line);
    else if (checkIsSwitchClause(token)) openClause(position);
  const chainArmCountMap = new Map<number, number>();
  for (const { chain, index } of bodies)
    chainArmCountMap.set(chain, Math.max(chainArmCountMap.get(chain) ?? 0, index + 1));
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
      : {
          armCount: chainArmCountMap.get(innermost.chain) ?? 0,
          chain: innermost.chain,
          endLine: chainEndLineMap.get(innermost.chain) ?? 0,
          index: innermost.index,
          isExhaustive: exhaustiveChains.has(innermost.chain),
        };
  };
};
