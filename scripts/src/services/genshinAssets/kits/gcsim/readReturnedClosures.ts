import type { GoToken } from "#src/models/genshinAssets/kits/gcsim/GoToken";
import type { ReturnedClosure } from "#src/models/genshinAssets/kits/gcsim/ReturnedClosure";

import { checkIsGoPunctuation } from "#src/services/genshinAssets/kits/gcsim/checkIsGoPunctuation";
import { findClosing } from "#src/services/genshinAssets/kits/gcsim/findClosing";

// Each closure a function returns in a file, read at its `return` token
export const readReturnedClosures = (tokens: readonly GoToken[]): ReturnedClosure[] =>
  tokens.flatMap((token, position) => {
    if (
      token.text !== "return" ||
      tokens[position + 1]?.text !== "func" ||
      !checkIsGoPunctuation(tokens[position + 2], "(")
    )
      return [];
    const parametersEnd = findClosing(tokens, position + 2, "(", ")");
    if (parametersEnd === undefined || !checkIsGoPunctuation(tokens[parametersEnd + 1], "{")) return [];
    const bodyEnd = findClosing(tokens, parametersEnd + 1, "{", "}");
    return bodyEnd === undefined ? [] : [{ bodyEnd, bodyStart: parametersEnd + 1 }];
  });
