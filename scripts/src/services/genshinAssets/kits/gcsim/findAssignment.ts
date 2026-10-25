import type { GoAssignment } from "#src/models/genshinAssets/kits/gcsim/GoAssignment";
import type { GoConstant } from "#src/models/genshinAssets/kits/gcsim/GoConstant";
import type { GoNamedFunction } from "#src/models/genshinAssets/kits/gcsim/GoNamedFunction";
import type { GoToken } from "#src/models/genshinAssets/kits/gcsim/GoToken";

import { GoAssignmentKind } from "#src/models/genshinAssets/kits/gcsim/GoAssignmentKind";
import { GoTokenKind } from "#src/models/genshinAssets/kits/gcsim/GoTokenKind";
import { checkIsGoPunctuation } from "#src/services/genshinAssets/kits/gcsim/checkIsGoPunctuation";
import { checkIsInBlocks } from "#src/services/genshinAssets/kits/gcsim/checkIsInBlocks";
import { findBlock } from "#src/services/genshinAssets/kits/gcsim/findBlock";
import { findOkDefault } from "#src/services/genshinAssets/kits/gcsim/findOkDefault";
import { readAssignmentKind } from "#src/services/genshinAssets/kits/gcsim/readAssignmentKind";
import { readConstellationBranch } from "#src/services/genshinAssets/kits/gcsim/readConstellationBranch";
import { readOtherClosures } from "#src/services/genshinAssets/kits/gcsim/readOtherClosures";

// The latest assignment to a name in a function before a position, and whether a block of its own always reaches the
// Position, so no branch between the two can skip it. An update reads the value it changes, which no constant gives.
// At a constellation, a constellation branch's `=` the constellation does not reach is left out, though its update is
// Not, and one it reaches always runs, so it reaches a position past its block in the block around it
export const findAssignment = (
  tokens: readonly GoToken[],
  scope: GoNamedFunction,
  name: string,
  position: number,
  constantMap: ReadonlyMap<string, GoConstant>,
  constellation: number | undefined,
): GoAssignment => {
  const okDefault = findOkDefault(tokens, scope, name, position, constantMap);
  if (okDefault !== undefined) return { kind: "dominating", valueStart: okDefault };
  const otherClosures = readOtherClosures(tokens, scope, position);
  let latest: undefined | { isTaken: boolean; kind: GoAssignmentKind; position: number };
  for (let previous = scope.bodyStart + 1; previous < position; previous++) {
    const kind =
      tokens[previous]?.kind === GoTokenKind.Identifier &&
      tokens[previous]?.text === name &&
      !checkIsGoPunctuation(tokens[previous - 1], ".") &&
      !checkIsInBlocks(otherClosures, previous)
        ? readAssignmentKind(tokens, previous)
        : undefined;
    if (kind === undefined) continue;
    const block = findBlock(tokens, previous);
    const threshold =
      constellation === undefined || kind !== GoAssignmentKind.Value
        ? undefined
        : readConstellationBranch(tokens, block.start);
    // A position inside such a branch reads its reassignment, which the constellation does not give
    const isLeftOut = threshold !== undefined && constellation !== undefined && threshold > constellation;
    if (!isLeftOut) latest = { isTaken: threshold !== undefined, kind, position: previous };
    else if (block.start < position && position < block.end) return { kind: "conditional" };
  }
  if (latest === undefined) return { kind: "none" };
  if (latest.kind === GoAssignmentKind.Update) return { kind: "conditional" };
  const block = findBlock(tokens, latest.position);
  if (block.start < position && position < block.end) return { kind: "dominating", valueStart: latest.position + 2 };
  // A taken branch's block is one the block around it always runs past, so a position after it in that block is reached
  const outer = findBlock(tokens, block.start);
  return latest.isTaken && block.end < position && outer.start < position && position < outer.end
    ? { kind: "dominating", valueStart: latest.position + 2 }
    : { kind: "conditional" };
};
