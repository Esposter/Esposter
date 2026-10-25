import type { GcsimAttackBranch } from "#src/models/genshinAssets/kits/gcsim/GcsimAttackBranch";
import type { GoBranchBody } from "#src/models/genshinAssets/kits/gcsim/GoBranchBody";
import type { GoBranchOpening } from "#src/models/genshinAssets/kits/gcsim/GoBranchOpening";
import type { GoBranchPlace } from "#src/models/genshinAssets/kits/gcsim/GoBranchPlace";
import type { GoSwitchFrame } from "#src/models/genshinAssets/kits/gcsim/GoSwitchFrame";
import type { GoToken } from "#src/models/genshinAssets/kits/gcsim/GoToken";

import { checkIsGoPunctuation } from "#src/services/genshinAssets/kits/gcsim/checkIsGoPunctuation";
import { checkIsSwitchClause } from "#src/services/genshinAssets/kits/gcsim/checkIsSwitchClause";
import { findStatementKeyword } from "#src/services/genshinAssets/kits/gcsim/findStatementKeyword";

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
