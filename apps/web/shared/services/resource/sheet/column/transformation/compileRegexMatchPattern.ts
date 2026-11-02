import { getResult } from "@esposter/shared";
import { RE2JS } from "re2js";

// The one compile a pattern goes through, so the transformation form refuses exactly what a column binds empty.
// RE2 matches in time linear in the cell, so no pattern can stall a read on the server or in a tab. Its syntax is
// Narrower: a backreference, a lookahead, a JavaScript `\u` escape and a lookbehind holding a capture are refused,
// and `LOOKBEHINDS` admits a lookbehind that holds none
export const compileRegexMatchPattern = (pattern: string) => getResult(() => RE2JS.compile(pattern, RE2JS.LOOKBEHINDS));
