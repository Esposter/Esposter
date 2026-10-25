import type { EnemyQueryLoop } from "#src/models/genshinAssets/kits/gcsim/EnemyQueryLoop";
import type { GoScope } from "#src/models/genshinAssets/kits/gcsim/GoScope";
import type { GoToken } from "#src/models/genshinAssets/kits/gcsim/GoToken";

import { GoExpressionKind } from "#src/models/genshinAssets/kits/gcsim/GoExpressionKind";
import { GoTokenKind } from "#src/models/genshinAssets/kits/gcsim/GoTokenKind";
import { checkIsGoPunctuation } from "#src/services/genshinAssets/kits/gcsim/checkIsGoPunctuation";
import { findClosing } from "#src/services/genshinAssets/kits/gcsim/findClosing";
import { parseGoExpression } from "#src/services/genshinAssets/kits/gcsim/parseGoExpression";
import { readGoHitbox } from "#src/services/genshinAssets/kits/gcsim/readGoHitbox";
import { readHitboxStart } from "#src/services/genshinAssets/kits/gcsim/readHitboxStart";
import { readRangeBodyStart } from "#src/services/genshinAssets/kits/gcsim/readRangeBodyStart";

// The callee of an area query whose enemies a loop reads, `c.Core.Combat.EnemiesWithinArea(area, filter)`: a loop over
// Its enemies fires at each one in the area, so a single-target hit it fires lands on every enemy there. A random subset
// Of the area, `RandomEnemiesWithinArea`, reaches only some of them, so it is no such query
const ENEMIES_WITHIN_AREA_CALLEE = "EnemiesWithinArea";

// Each loop over an area query's enemies in a file, read at its `range` token
export const readEnemyQueryLoops = (tokens: readonly GoToken[], scope: GoScope, file: string): EnemyQueryLoop[] =>
  tokens.flatMap((token, position) => {
    if (token.kind !== GoTokenKind.Identifier || token.text !== "range") return [];
    const bodyStart = readRangeBodyStart(tokens, position + 1);
    if (bodyStart === undefined) return [];
    // A bare local the loop ranges over, `range targets {`, is the query its assignment gives, else the query in place
    const isLocalRange =
      tokens[position + 1]?.kind === GoTokenKind.Identifier && checkIsGoPunctuation(tokens[position + 2], "{");
    const queryStart = isLocalRange
      ? scope.resolveAssignment(tokens[position + 1]?.text ?? "", position)
      : position + 1;
    if (queryStart === undefined) return [];
    const query = parseGoExpression(tokens, queryStart).expression;
    const bodyEnd = findClosing(tokens, bodyStart, "{", "}");
    if (
      query.kind !== GoExpressionKind.Call ||
      query.callee.split(".").at(-1) !== ENEMIES_WITHIN_AREA_CALLEE ||
      bodyEnd === undefined
    )
      return [];
    const areaStart = query.parameterStarts[0];
    const areaValueStart = areaStart === undefined ? undefined : readHitboxStart(tokens, areaStart, queryStart, scope);
    return [
      {
        bodyEnd,
        bodyStart,
        hitbox:
          areaValueStart === undefined
            ? undefined
            : readGoHitbox(
                tokens,
                areaValueStart,
                (name) => scope.resolveName(name, queryStart),
                file,
                (name) => scope.resolveAssignment(name, queryStart),
              ),
      },
    ];
  });
