import type { GoNamedFunction } from "#src/models/genshinAssets/kits/gcsim/GoNamedFunction";
import type { GoToken } from "#src/models/genshinAssets/kits/gcsim/GoToken";

import { GoTokenKind } from "#src/models/genshinAssets/kits/gcsim/GoTokenKind";
import { checkIsGoPunctuation } from "#src/services/genshinAssets/kits/gcsim/checkIsGoPunctuation";
import { findClosing } from "#src/services/genshinAssets/kits/gcsim/findClosing";
import { readParameterNames } from "#src/services/genshinAssets/kits/gcsim/readParameterNames";

// The function a `func` token declares, `func (c *char) danceDoubleTicker(...) {` or `func name(...) {`, else undefined.
// A closure, `func() {`, has no name and is no function here
export const readNamedFunction = (tokens: readonly GoToken[], funcPosition: number): GoNamedFunction | undefined => {
  let namePosition = funcPosition + 1;
  if (checkIsGoPunctuation(tokens[namePosition], "(")) {
    const receiverEnd = findClosing(tokens, namePosition, "(", ")");
    if (receiverEnd === undefined) return undefined;
    namePosition = receiverEnd + 1;
  }
  const name = tokens[namePosition];
  if (name?.kind !== GoTokenKind.Identifier || !checkIsGoPunctuation(tokens[namePosition + 1], "(")) return undefined;
  const parametersEnd = findClosing(tokens, namePosition + 1, "(", ")");
  if (parametersEnd === undefined) return undefined;
  let bodyStart = parametersEnd + 1;
  while (tokens[bodyStart] !== undefined && !checkIsGoPunctuation(tokens[bodyStart], "{")) bodyStart++;
  const bodyEnd = findClosing(tokens, bodyStart, "{", "}");
  return bodyEnd === undefined
    ? undefined
    : {
        bodyEnd,
        bodyStart,
        name: name.text,
        nameIndex: namePosition,
        parameters: readParameterNames(tokens, namePosition + 1, parametersEnd),
      };
};
