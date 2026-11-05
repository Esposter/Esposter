import type { Program } from "oxc-parser";

import { InvalidOperationError, Operation } from "@esposter/shared";
import { parseSync } from "oxc-parser";

// The syntax tree of one TypeScript source with no node linked to the node it sits in, for a check that reads only a
// Node's children. Parentheses are kept as nodes, so a bracketed subject is seen where it was written. A source that
// Does not parse is thrown, since the parser's tree for it is partial and a check would read it as clean
export const parseSourceUnlinked = (text: string): Program => {
  const { errors, program } = parseSync("source.ts", text, { lang: "ts", preserveParens: true });
  const [firstError] = errors;
  if (firstError) throw new InvalidOperationError(Operation.Read, "source", firstError.message);
  return program;
};
