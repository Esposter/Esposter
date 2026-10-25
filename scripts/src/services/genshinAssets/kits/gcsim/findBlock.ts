import type { GoBlock } from "#src/models/genshinAssets/kits/gcsim/GoBlock";
import type { GoToken } from "#src/models/genshinAssets/kits/gcsim/GoToken";

import { checkIsCaseClause } from "#src/services/genshinAssets/kits/gcsim/checkIsCaseClause";
import { checkIsGoPunctuation } from "#src/services/genshinAssets/kits/gcsim/checkIsGoPunctuation";
import { findClosing } from "#src/services/genshinAssets/kits/gcsim/findClosing";

// The block an assignment at the position sits in, walking back to the brace or `case` opening it and forward to the
// Brace or the next `case` closing it
export const findBlock = (tokens: readonly GoToken[], position: number): GoBlock => {
  let depth = 0;
  for (let previous = position - 1; previous >= 0; previous--) {
    const token = tokens[previous];
    if (checkIsGoPunctuation(token, "}")) depth++;
    else if (checkIsGoPunctuation(token, "{")) {
      if (depth === 0) return { end: findClosing(tokens, previous, "{", "}") ?? tokens.length, start: previous };
      depth--;
    } else if (depth === 0 && checkIsCaseClause(token)) {
      let end = tokens.length;
      let caseDepth = 0;
      for (let next = previous + 1; next < tokens.length; next++)
        if (checkIsGoPunctuation(tokens[next], "{")) caseDepth++;
        else if (checkIsGoPunctuation(tokens[next], "}")) {
          if (caseDepth === 0) {
            end = next;
            break;
          }
          caseDepth--;
        } else if (caseDepth === 0 && checkIsCaseClause(tokens[next])) {
          end = next;
          break;
        }

      return { end, start: previous };
    }
  }
  return { end: tokens.length, start: -1 };
};
