import type { GoToken } from "#src/models/genshinAssets/kits/gcsim/GoToken";

import { GoTokenKind } from "#src/models/genshinAssets/kits/gcsim/GoTokenKind";
import { checkIsGoPunctuation } from "#src/services/genshinAssets/kits/gcsim/checkIsGoPunctuation";
import { skipGoBrackets } from "#src/services/genshinAssets/kits/gcsim/skipGoBrackets";

// The fields a character package's own `char` struct declares, read from its top-level lines. An embedded type such as
// `*tmpl.Character` declares none, as its fields are written outside the package
export const readCharFields = (tokens: readonly GoToken[], charFieldSet: Set<string>): void => {
  for (const [position, token] of tokens.entries()) {
    if (
      token.kind !== GoTokenKind.Identifier ||
      token.text !== "type" ||
      tokens[position + 1]?.text !== "char" ||
      tokens[position + 2]?.text !== "struct" ||
      !checkIsGoPunctuation(tokens[position + 3], "{")
    )
      continue;
    const end = skipGoBrackets(tokens, position + 3) - 1;
    let depth = 0;
    let isLineStart = true;
    for (let cursor = position + 4; cursor < end; cursor++) {
      const current = tokens[cursor];
      if (current === undefined) break;
      if (current.kind === GoTokenKind.Newline) {
        isLineStart = true;
        continue;
      }
      if (
        checkIsGoPunctuation(current, "(") ||
        checkIsGoPunctuation(current, "[") ||
        checkIsGoPunctuation(current, "{")
      )
        depth++;
      else if (
        checkIsGoPunctuation(current, ")") ||
        checkIsGoPunctuation(current, "]") ||
        checkIsGoPunctuation(current, "}")
      )
        depth--;
      else if (
        isLineStart &&
        depth === 0 &&
        current.kind === GoTokenKind.Identifier &&
        !checkIsGoPunctuation(tokens[cursor + 1], ".")
      ) {
        // A line's names run `a, b int`, and a name followed by a dot is an embedded package's selector, not a field
        let names = cursor;
        charFieldSet.add(current.text);
        while (checkIsGoPunctuation(tokens[names + 1], ",") && tokens[names + 2]?.kind === GoTokenKind.Identifier) {
          names += 2;
          charFieldSet.add(tokens[names]?.text ?? "");
        }
      }
      isLineStart = false;
    }
  }
};
